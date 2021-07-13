# 分布式事务管理器dtm的客户端sdk

# typescript使用

```
import * as dtmcli from "dtmcli"

async function FireTcc() {
  let dtm = "http://localhost:8080/api/dtmsvr"
  let svc = "http://localhost:4005/api/msg/testDtm"
  await dtmcli.tccGlobalTransaction(dtm, async (t: dtmcli.Tcc) => {
    let req = { amount: 30 }
    console.log("calling trans out")
    await t.callBranch(req, svc + "/TransOutTry", svc + "/TransOutConfirm", svc + "/TransOutCancel")
    console.log("calling trans in")
    await t.callBranch(req, svc + "/TransInTry", svc + "/TransInConfirm", svc + "/TransInCancel")
  })
}
```

# javascript使用

```
const dtmcli = require("dtmcli")

async function FireTcc() {
  let dtm = "http://localhost:8080/api/dtmsvr"
  let svc = "http://localhost:4005/api"
  await dtmcli.tccGlobalTransaction(dtm, async (t) => {
    let req = { amount: 30 }
    console.log("calling trans out")
    await t.callBranch(req, svc + "/TransOutTry", svc + "/TransOutConfirm", svc + "/TransOutCancel")
    console.log("calling trans in")
    await t.callBranch(req, svc + "/TransInTry", svc + "/TransInConfirm", svc + "/TransInCancel")
  })
}
```

# 可运行的使用示例

见[https://github.com/yedf/dtmcli-node-sample](https://github.com/yedf/dtmcli-node-sample)

