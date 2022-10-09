// ResultFailure for result of a trans/trans branch
// Same as HTTP status 409 and GRPC code 10
export const ResultFailure = 'FAILURE'
// ResultSuccess for result of a trans/trans branch
// Same as HTTP status 200 and GRPC code 0
export const ResultSuccess = 'SUCCESS'
// ResultOngoing for result of a trans/trans branch
// Same as HTTP status 425 and GRPC code 9
export const ResultOngoing = 'ONGOING'


// OpTry branch type for TCC
export const OpTry = 'try'
// OpConfirm branch type for TCC
export const OpConfirm = 'confirm'
// OpCancel branch type for TCC
export const OpCancel = 'cancel'
// OpAction branch type for message, SAGA, XA
export const OpAction = 'action'
// OpCompensate branch type for SAGA
export const OpCompensate = 'compensate'
// OpCommit branch type for XA
export const OpCommit = 'commit'
// OpRollback branch type for XA
export const OpRollback = 'rollback'

// MsgDoBranch0 const for DoAndSubmit barrier branch
export const MsgDoBranch0 = '00'
// MsgDoBarrier1 const for DoAndSubmit barrier barrierID
export const MsgDoBarrier1 = '01'
// MsgDoOp const for DoAndSubmit barrier op
export const MsgDoOp = 'msg'
