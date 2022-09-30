import { Sequelize, Transaction } from 'sequelize';
import { ErrDuplicated } from './error';
import { MsgDoOp, OpAction, OpCancel, OpCompensate, OpRollback, OpTry } from './constants';
import { Barrier } from './dao';

// BarrierBusiFunc type for busi func
export type BarrierBusiFunc = (tx: Transaction) => Promise<void>;

const OP_MAP: Record<string, string> = {
  [OpCancel]: OpTry, // tcc
  [OpCompensate]: OpAction, // saga
  [OpRollback]: OpAction, // workflow
};

export class BranchBarrier {
  transType: string;
  gid: string;
  branchId: string;
  op: string;
  barrierId = 0;
  dbType: string;
  barrierTableName: string;

  constructor(transType: string, gid: string, branchId: string, op: string) {
    this.transType = transType;
    this.gid = gid;
    this.branchId = branchId;
    this.op = op;
    if (this.transType === '' || this.gid === '' || this.branchId === '' || this.op === '') {
      throw new Error(`invalid trans info ${JSON.stringify(this)}`);
    }
  }

  toString(): string {
    return `transInfo: ${this.transType} ${this.gid} ${this.branchId} ${this.op}`;
  }

  async call(tx: Transaction, busiCall: BarrierBusiFunc): Promise<void> {
    const bid = this.newBarrierId();
    const originOp = OP_MAP[this.op];
    try {
      const [_originRes, originCreated] = await Barrier.upsert(
        {
          transType: this.transType,
          gid: this.gid,
          branchId: this.branchId,
          op: originOp,
          barrierId: bid,
          reason: this.op,
        },
        { transaction: tx }
      );

      const [_res, currentCreated] = await Barrier.upsert(
        {
          transType: this.transType,
          gid: this.gid,
          branchId: this.branchId,
          op: this.op,
          barrierId: bid,
          reason: this.op,
        },
        { transaction: tx }
      );

      if (this.op === MsgDoOp && !currentCreated) {
        // for msg's DoAndSubmit, repeated insert should be rejected.
        throw ErrDuplicated;
      }

      if (
        ((this.op === OpCancel || this.op === OpCompensate || this.op === OpRollback) && originCreated) || // null compensate
        !currentCreated // repeated request or dangled request
      ) {
        await tx.rollback();
        return;
      }

      await busiCall(tx);

      await tx.commit();
    } catch (error: unknown) {
      await tx.rollback();
    }
  }

  async callWithDB(db: Sequelize, busiCall: BarrierBusiFunc): Promise<void> {
    const tx = await db.transaction();

    await this.call(tx, busiCall);
  }

  private newBarrierId(): string {
    this.barrierId++;
    if (this.barrierId >= 10) {
      return String(this.barrierId);
    }
    return `0${this.barrierId}`;
  }
}
