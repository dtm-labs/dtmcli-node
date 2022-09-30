import 'reflect-metadata';
import { jsonObject, jsonMember, jsonArrayMember, toJson } from 'typedjson';

export class BranchIdGen {
  branchId = '';
  subBranchId = 0;

  constructor(branchId: string) {
    this.branchId = branchId;
  }

  newBranchId(): string {
    if (this.subBranchId >= 99) {
      throw new Error('branch id is larger than 99');
    }
    if (this.branchId?.length >= 20) {
      throw new Error('branch id length is longer than 20');
    }

    this.subBranchId += 1;
    return this.currentSubBranchId();
  }

  currentSubBranchId(): string {
    return `${this.branchId}${this.getSubIdStr()}`;
  }

  getSubIdStr(): string {
    if (this.subBranchId < 10) {
      return `0${this.subBranchId}`;
    }
    return this.subBranchId.toString();
  }
}

@jsonObject
export class TransOptions {
  @jsonMember({ name: 'wait_result', constructor: Boolean })
  waitResult: boolean;
  @jsonMember({ name: 'timeout_to_fail', constructor: Number })
  timeoutToFail: number;
  @jsonMember({ name: 'request_timeout', constructor: Number })
  requestTimeout: number;
  @jsonMember({ name: 'retry_interval', constructor: Number })
  retryInterval: number;
  @jsonMember({ name: 'branch_headers', constructor: Object })
  branchHeaders: Record<string, string>;
  @jsonMember({ name: 'concurrent', constructor: Boolean })
  concurrent: boolean;
  @jsonMember({ name: 'retry_limit', constructor: Number })
  retryLimit: number;
  @jsonMember({ name: 'retry_count', constructor: Number })
  retryCount: number;
}

type TransType = 'saga' | 'tcc' | 'msg' | 'xa';

@jsonObject
@toJson
export class TransBase extends TransOptions {
  @jsonMember(String)
  gid: string;
  @jsonMember({ name: 'trans_type', constructor: String })
  transType: TransType;
  dtm: string;
  @jsonMember({ name: 'custom_data', constructor: String })
  customData: string;
  // use in MSG/SAGA
  @jsonArrayMember(Object)
  steps: Record<string, string>[] = [];
  // used in MSG/SAGA
  @jsonArrayMember(String)
  payloads: string[] = [];
  op: string;
  // used in MSG
  @jsonMember({ name: 'query_prepared', constructor: String })
  queryPrepared: string;
  @jsonMember(String)
  protocol: string;
  @jsonMember({ name: 'rollback_reason', constructor: String })
  rollbackReason: string;

  branchIdGen: BranchIdGen;

  constructor(gid: string, transType: TransType, dtm: string, branchId: string) {
    super();
    this.branchIdGen = new BranchIdGen(branchId);
    this.gid = gid;
    this.transType = transType;
    this.dtm = dtm;
  }
}
