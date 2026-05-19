import axios, { AxiosError } from 'axios';

//const navigation = useNavigation();
let request = axios.create({
  baseURL: 'https://betadev.kashremit.com/CashUIMR.svc/',

  //  baseURL: 'https://service.kashremit.com/CashUIMR.svc/',
  timeout: 40000,
  withCredentials: false,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'origin': '*',
    'referer': '*',
    'Content-Type': 'application/json',
  }
});

request.interceptors.request.use(
  (config) => {
    config.params = {
      ...config.params,
    }
    console.log("apiClient REQUEST:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: JSON.stringify(config.data, null, 2)
    });
    return config;
  },
  (error) => {
    console.log("apiClient REQUEST ERROR:", error);
    genericErrorHandler(error);
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => {
    console.log("apiClient RESPONSE:", {
      status: response.status,
      url: response.config.url,
      data: JSON.stringify(response.data, null, 2)
    });
    return response;
  },
  (error) => {
    console.log("apiClient RESPONSE ERROR:", {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: JSON.stringify(error.response?.data, null, 2)
    });
    genericErrorHandler(error);
    return Promise.reject(error);
  }
);

export const setClientToken = (token: any) => {
  request.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};

export const genericErrorHandler = (error: AxiosError<any>) => {
  console.log("NETWORK ERROR DETAILS:", {
    message: error.message,
    code: error.code,
    response: error.response?.data,
    status: error.response?.status,
    url: error.config?.url,
    baseURL: error.config?.baseURL
  });
};


export default request;