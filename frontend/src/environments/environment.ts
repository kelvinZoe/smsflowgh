const isLocalhost =
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const environment = {
  apiUrl: isLocalhost ? 'http://localhost:3000/api' : 'https://smsflowgh-api.onrender.com/api'
};
