import axios from 'axios'
import { DTMError } from './error'

export class IdGenerator {
  parentId: string
  branchId: number
  newBranchId(): string {
    if (this.branchId >= 99) {
      throw "branch id is larger than 99"
    }
    if (this.parentId.length > 20) {
      throw "total branch id is longer than 20"
    }
    this.branchId = this.branchId + 1
    return this.parentId + ('' + this.branchId).padStart(2, '0')
  }
  constructor(parentId = "") {
    this.parentId = parentId
    this.branchId = 0
  }
}

export async function genGid(dtmUrl: string): Promise<string> {
  let { data, status } = await axios.get(dtmUrl + "/newGid")
  checkStatus(status)
  return data.gid
}

export function checkStatus(status: number) {
  if (status !== 200) {
    throw new DTMError("bad http response status: " + status)
  }
}