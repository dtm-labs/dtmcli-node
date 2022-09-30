import axios, { AxiosInstance } from 'axios';
import { checkStatus } from './id';

export interface Step {
  action: string
  compensate: string
}

export interface Payload {
  gid: string
  trans_type: string
  steps: Step[]
  payloads: string[]
  custom_data?: string
}

export class Saga {
  static transType = 'saga';
  dtm: string;
  gid: string;
  dtmClient: AxiosInstance;

  private steps: Step[] = [];
  private payloads: string[] = [];
  private orders: Record<number, number[]> = {};
  private concurrent = false;

  constructor(dtmUrl: string, gid: string) {
    this.dtm = dtmUrl;
    this.gid = gid;
    this.dtmClient = axios.create({
      baseURL: dtmUrl
    });
  }

  add(action: string, compensate: string, postData: unknown) {
    this.steps.push({
      action,
      compensate,
    });

    this.payloads.push(JSON.stringify(postData));
    return this;
  }

  addBranchOrder(branch: number, preBranches: number[]) {
    this.orders[branch] = preBranches;
    return this;
  }

  enableConcurrent() {
    this.concurrent = true;
    return this;
  }

  async submit() {
    const payload = this.buildPayload();
    const { status } = await this.dtmClient.post('/submit', payload);
    checkStatus(status);
  }

  buildPayload() {
    const payload: Payload =  {
      gid: this.gid,
      trans_type: Saga.transType,
      steps: this.steps,
      payloads: this.payloads,
    };

    if (this.concurrent) {
      payload.custom_data = JSON.stringify({
        concurrent: this.concurrent,
        orders: this.orders,
      });
    }

    return payload;
  }
}
