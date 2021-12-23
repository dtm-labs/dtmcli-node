import axios from 'axios'
import { DTMError } from './error'

export const mustGenGid = async (server: string) => {
  const { data } = await axios.get(`${server}/newGid`)
  if (!data.gid) {
    throw new DTMError(`newGid error, response ${JSON.stringify(data)}`)
  }
  return data.gid
}
