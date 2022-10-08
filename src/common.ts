import axios, { AxiosResponse, Method } from 'axios'
import { DTMError } from './error'
import { TransBase } from './base'
import { ResultFailure, ResultOngoing } from './constants'
import { ErrFailure, ErrOngoing } from './error'

export const mustGenGid = async (server: string) => {
  const { data } = await axios.get(`${server}/newGid`)
  if (!data.gid) {
    throw new DTMError(`newGid error, response ${JSON.stringify(data)}`)
  }
  return data.gid
}

export async function transCallDtm(tb: TransBase, body: unknown, operation: string): Promise<AxiosResponse> {
  const res = await axios.request({
    url: `${tb.dtm}/${operation}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify(body),
    timeout: tb.requestTimeout,
  })
  const resText = JSON.stringify(res.data)
  if (res.status !== 200 || resText.includes(ResultFailure)) {
    throw new DTMError(resText)
  }
  return res
}
// RespAsErrorCompatible translate response to error
// compatible with version < v1.10
export function respAsErrorCompatible(resp: AxiosResponse): void {
  const code = resp.status
  const str = JSON.stringify(resp.data)

  if (code === 425 || str.includes(ResultOngoing)) {
    throw ErrOngoing.withDetail(str)
  } else if (code === 409 || str.includes(ResultFailure)) {
    throw ErrFailure.withDetail(str)
  } else if (code !== 200) {
    throw new Error(str)
  }
}

export async function requestBranch(
  t: TransBase,
  method: Method,
  body: unknown,
  branchId: string,
  op: string,
  url: string
): Promise<AxiosResponse | undefined> {
  if (!url) {
    return undefined
  }
  const searchParams: Record<string, string> = {
    "dtm": t.dtm,
    "gid": t.gid,
    'branch_id': branchId,
    'trans_type': t.transType,
    'op': op,
  }
  if (t.transType === 'xa') {
    searchParams['phase2_url'] = url
  }

  const res = await axios.request({
    url,
    method,
    params: searchParams,
    data: JSON.stringify(body),
    headers: t.branchHeaders,
    timeout: t.requestTimeout,
  })
  await respAsErrorCompatible(res)
  return res
}
