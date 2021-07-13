import { IdGenerator, genGid, checkStatus } from './id'
import axios, { AxiosResponse } from 'axios'

export class Tcc {
  IdGen: IdGenerator
  dtm: string
  gid: string
  constructor(dtmUrl: string, gid: string) {
    this.dtm = dtmUrl
    this.gid = gid
    this.IdGen = new IdGenerator()
  }
  async callBranch(body: any, tryUrl: string, confirmUrl: string, cancelUrl: string): Promise<AxiosResponse> {
    let branchId = this.IdGen.newBranchId()
    let { status } = await axios.post(this.dtm + "/registerTccBranch", {
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

export type TccCallback = (tcc: Tcc) => Promise<void>

export async function tccGlobalTransaction(dtmUrl: string, cb: TccCallback): Promise<string> {
  let tcc = new Tcc(dtmUrl, await genGid(dtmUrl))
  let tbody = {
    gid: tcc.gid,
    trans_type: "tcc",
  }
  try {
    let { status } = await axios.post(tcc.dtm + "/prepare", tbody)
    checkStatus(status)
    await cb(tcc)
    await axios.post(tcc.dtm + "/submit", tbody)
  } catch (e) {
    console.error(e)
    await axios.post(tcc.dtm + "/abort", tbody)
    return ""
  }
  return tcc.gid
}

export async function tccFromReq(dtmUrl: string, gid: string, branchId: string): Promise<Tcc> {
  if (!dtmUrl || !gid || !branchId) {
    throw `bad req info for tcc dtm: ${dtmUrl} gid: ${gid} branchId: ${branchId}`
  }
  let tcc = new Tcc(dtmUrl, gid)
  tcc.IdGen = new IdGenerator(branchId)
  return tcc
}