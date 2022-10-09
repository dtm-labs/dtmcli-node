import { Sequelize } from 'sequelize'
import { jsonObject } from 'typedjson'
import { MsgDoBranch0, MsgDoOp } from './constants'
import { ErrFailure } from './error'
import { BarrierBusiFunc, BranchBarrier } from './barrier'
import { transCallDtm, requestBranch } from './common'
import { TransBase } from './base'

@jsonObject
export class Msg extends TransBase {
  delay = 0

  constructor(dtmUrl: string, gid: string) {
    super(gid, 'msg', dtmUrl, '')
  }

  // add a new step
  add(action: string, postData: unknown): Msg {
    this.steps.push({ action })
    this.payloads.push(JSON.stringify(postData))
    return this
  }

  // delay call branch, unit second
  setDelay(delay: number): Msg {
    this.delay = delay
    return this
  }

  // prepare the msg, msg will later be submitted
  async prepare(queryPrepared: string): Promise<void> {
    this.queryPrepared = queryPrepared || this.queryPrepared
    await transCallDtm(this, this, 'prepare')
  }

  // add custom options to the request context
  buildCustomOptions(): void {
    if (this.delay > 0) {
      this.customData = `{"delay": ${this.delay}}`
    }
  }

  // Submit submit the msg
  async submit(): Promise<void> {
    this.buildCustomOptions()
    await transCallDtm(this, this, 'submit')
  }

  // doAndSubmit one method for the entire prepare->busi->submit
  // the error returned by busiCall will be returned
  // if busiCall return ErrFailure, then abort is called directly
  // if busiCall return not nil error other than ErrFailure, then DoAndSubmit will call queryPrepared to get the result
  async doAndSubmit(queryPrepared: string, busiCall: (bb: BranchBarrier) => Promise<void>): Promise<void> {
    const bb = new BranchBarrier(this.transType, this.gid, MsgDoBranch0, MsgDoOp)
    await this.prepare(queryPrepared)
    try {
      await busiCall(bb)
    } catch (error: unknown) {
      // if busiCall return an error other than failure, we will query the result
      if (!ErrFailure.isSameType(error)) {
        await requestBranch(this, 'GET', null, bb.branchId, bb.op, queryPrepared)
        await this.submit()
        return
      } else {
        await transCallDtm(this, this, 'abort')
      }
      throw error
    }
    await this.submit()
  }

  async doAndSubmitDB(queryPrepared: string, db: Sequelize, busiCall: BarrierBusiFunc): Promise<void> {
    return this.doAndSubmit(queryPrepared, function (bb: BranchBarrier): Promise<void> {
      return bb.callWithDB(db, busiCall)
    })
  }
}
