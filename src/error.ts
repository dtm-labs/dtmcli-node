export class DTMError extends Error {
  type: string
  detail: string | undefined
  constructor(type = 'DEFAULT', detail?: string) {
    super(`${type}: ${detail}`)
    this.type = type
    this.detail = detail
  }

  withDetail(detail: string): DTMError {
    return new DTMError(this.type, detail)
  }

  isSameType(error: unknown): boolean {
    if (!(error instanceof DTMError)) {
      return false
    }
    return error.type === this.type
  }
}

// ErrFailure error for returned failure
export const ErrFailure = new DTMError('FAILURE')

// ErrOngoing error for returned ongoing
export const ErrOngoing = new DTMError('ONGOING')

// ErrDuplicated error of DUPLICATED for only msg
// if QueryPrepared executed before call. then DoAndSubmit return this error
export const ErrDuplicated = new DTMError('DUPLICATED')
