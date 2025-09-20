
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  pusher: {
    key: '0c04171bd6d297f0bc7f',
    cluster: 'ap1',
    enabled: true ,
    pollingMs: 15000,
    authEndpoint: 'http://localhost:8080/api/chat/pusher/auth'
  }
};

