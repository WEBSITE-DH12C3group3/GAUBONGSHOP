
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  pusher: {
    key: '0c04171bd6d297f0bc7f',
    cluster: 'ap1',
    enabled: true ,
    pollingMs: 15000,
    authEndpoint: 'http://localhost:8080/api/chat/pusher/auth'
  },
  vnApi: {
    provincesBaseV1: 'https://provinces.open-api.vn/api/v1', // 63 tỉnh (ổn định)
    // provincesBaseV2: 'https://provinces.open-api.vn/api/v2', // sau sáp nhập (chưa chính thức)
    vnappmobBase: 'https://vapi.vnappmob.com/api/v2'
  }
};

