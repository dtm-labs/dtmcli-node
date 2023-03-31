import type { ParsedUrlQuery } from 'querystring'
import axios, { AxiosResponse, AxiosInstance } from 'axios'
import { IdGenerator, genGid, checkStatus } from './id'
import { DTMError } from './error'

export class Tcc {
  IdGen: IdGenerator
  dtm: string
  gid: string
  dtmClient: AxiosInstance

  constructor(dtmUrl: string, gid: string) {
    this.dtm = dtmUrl
    this.gid = gid
    this.IdGen = new IdGenerator()
    this.dtmClient = axios.create({
      baseURL: dtmUrl
    })
  }

  async callBranch<T = any>(body: any, tryUrl: string, confirmUrl: string, cancelUrl: string): Promise<AxiosResponse<T>> {
    const branchId = this.IdGen.newBranchId()
    const { status } = await this.dtmClient.post("/registerTccBranch", {
      "gid": this.gid,
      "branch_id": branchId,
      "trans_type": "tcc",
      "status": "prepared",
      "data": JSON.stringify(body),
      "try": tryUrl,
      "confirm": confirmUrl,
      "cancel": cancelUrl,
    })
    checkStatus(status)
    return await axios.post(tryUrl, body, {
      params: {
        gid: this.gid,
        trans_type: "tcc",
        branch_id: branchId,
        branch_type: "try",
      }
    })
  }
}

export interface Options {
  waitResult?: boolean;
  timeoutToFail?: number;
  retryInterval?: number;
  branchHeaders?: Map<string, string>;
  cb: TccCallback;
}
export type TccCallback = (tcc: Tcc) => Promise<void>

export async function tccGlobalTransaction(
  dtmUrl: string,
  options: Options
): Promise<string>;
export async function tccGlobalTransaction(
  dtmUrl: string,
  options: TccCallback
): Promise<string>;
export async function tccGlobalTransaction(
  dtmUrl: string,
  options: any
): Promise<string> {
  let cb, other;
  if (typeof options == "object") {
    cb = options.cb;
    other = {
      wait_result: options.waitResult,
      retry_interval: options.retryInterval,
      timeout_to_fail: options.timeoutToFail,
      branch_headers: options.branchHeaders,
    };
  } else {
    cb = options;
  }
  const tcc = new Tcc(dtmUrl, await genGid(dtmUrl))
  const tbody = {
    gid: tcc.gid,
    trans_type: "tcc",
    ...other
  }
  try {
    const { status } = await tcc.dtmClient.post("/prepare", tbody)
    checkStatus(status)
    await cb(tcc)
    await tcc.dtmClient.post("/submit", tbody)
  } catch (e) {
    console.error(e)
    await tcc.dtmClient.post("/abort", tbody)
    return ""
  }
  return tcc.gid
}

export function tccFromReq(dtmUrl: string, gid: string, branchId: string) {
  if (!dtmUrl || !gid || !branchId) {
    throw new DTMError(`bad req info for tcc dtm: ${dtmUrl} gid: ${gid} branchId: ${branchId}`)
  }
  const tcc = new Tcc(dtmUrl, gid)
  tcc.IdGen = new IdGenerator(branchId)
  return tcc
}

export function tccFromQuery(dtmUrl: string, query: ParsedUrlQuery) {
  const { gid, branch_id: branchId } = query
  if (!dtmUrl || !gid || !branchId) {
    throw new DTMError(`bad req info for tcc dtm: ${dtmUrl} gid: ${gid} branchId: ${branchId}`)
  }
  const tcc = new Tcc(dtmUrl, gid as string)
  tcc.IdGen = new IdGenerator(branchId as string)
  return tcc
}
