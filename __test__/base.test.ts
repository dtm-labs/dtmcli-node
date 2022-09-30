import { TransBase } from '../src/base';

test('TransOptions', () => {
  const option: TransBase = new TransBase('1', 'msg', 'https://1', '1_1');
  option.waitResult = true;
  option.timeoutToFail = 1000;
  option.concurrent = false;
  option.steps = [{ a: 'a' }, { b: 'b' }];
  expect(JSON.stringify(option)).toBe(
    '{"wait_result":true,"timeout_to_fail":1000,"concurrent":false,"gid":"1","trans_type":"msg","steps":[{"a":"a"},{"b":"b"}],"payloads":[]}'
  );
});
