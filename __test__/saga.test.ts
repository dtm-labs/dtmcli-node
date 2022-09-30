import { Saga } from '../src/saga';

const svc = "http://localhost:8082/api/busi_start";
const req = { amount: 30 };

describe('saga payload should same as golang', () => {
  it('without custom_data', () => {
    const saga = new Saga('fake', 'cdd275c0-a82d-49b4-af53-b01ead1385b3');
    saga.add(svc+'/TransOut', svc+'/TransOutCompensate', req);
    saga.add(svc+'/TransIn', svc+'/TransInCompensate', req);

    expect(saga.buildPayload()).toStrictEqual({
      gid: "cdd275c0-a82d-49b4-af53-b01ead1385b3",
      trans_type: "saga",
      steps: [
        {
          action: "http://localhost:8082/api/busi_start/TransOut",
          compensate: "http://localhost:8082/api/busi_start/TransOutCompensate",
        },
        {
          action: "http://localhost:8082/api/busi_start/TransIn",
          compensate: "http://localhost:8082/api/busi_start/TransInCompensate",
        },
      ],
      payloads: ['{"amount":30}', '{"amount":30}'],
    });
  });

  it('with custom_data', () => {
    const saga = new Saga('fake', 'c46f408b-5ed1-4d0b-b4ed-32ffb1fe411d');
    saga.add(svc+'/TransOut', svc+'/TransOutCompensate', req);
    saga.add(svc+'/TransOut', svc+'/TransOutCompensate', req);
    saga.add(svc+'/TransIn', svc+'/TransInCompensate', req);
    saga.add(svc+'/TransIn', svc+'/TransInCompensate', req);
    saga.addBranchOrder(2, [0, 1]).addBranchOrder(3, [0, 1]);
    saga.enableConcurrent();

    expect(saga.buildPayload()).toStrictEqual({
      gid: "c46f408b-5ed1-4d0b-b4ed-32ffb1fe411d",
      trans_type: "saga",
      custom_data: '{"concurrent":true,"orders":{"2":[0,1],"3":[0,1]}}',
      steps: [
        {
          action: "http://localhost:8082/api/busi_start/TransOut",
          compensate: "http://localhost:8082/api/busi_start/TransOutCompensate",
        },
        {
          action: "http://localhost:8082/api/busi_start/TransOut",
          compensate: "http://localhost:8082/api/busi_start/TransOutCompensate",
        },
        {
          action: "http://localhost:8082/api/busi_start/TransIn",
          compensate: "http://localhost:8082/api/busi_start/TransInCompensate",
        },
        {
          action: "http://localhost:8082/api/busi_start/TransIn",
          compensate: "http://localhost:8082/api/busi_start/TransInCompensate",
        },
      ],
      payloads: [
        '{"amount":30}',
        '{"amount":30}',
        '{"amount":30}',
        '{"amount":30}',
      ],
    });
  });
});
