import { createMocks } from 'node-mocks-http';
import getResults from '../pages/api/accommodation';

describe('/api/accommodation', () => {
  test('sample test', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        // 'filters\[Active\][$eq]': false
      }
    });
    await getResults(req, res);
    expect(res._getStatusCode()).toBe(200);
    console.log(JSON.parse(res._getData()))
  })
})
