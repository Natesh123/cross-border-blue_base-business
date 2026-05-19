import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ApiRoutes from "../routes/api.routes";

interface HeaderProps {
    "Content-Type": string;
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Methods": string;
    "origin": string;
    "referer": string;
    Authorization: string;
}
export const getHeaders = (): HeaderProps => {
    let headers: any;
    let user: any;

    AsyncStorage.getItem('user').then(value => {
        if (value) {
            user = JSON.parse(value)
        }
    })

    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        "origin": "*",
        "referer": "*",
        Authorization: `Bearer ${user && user.Token ? user.Token : ""
            }`,
    };
    return headers;
};


const axiosInstance = axios.create({
    baseURL: ApiRoutes.BASE_URL,
    timeout: 40000,
    withCredentials: false,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'origin': '*',
        'referer': '*'
    }
});

const USER = (typeof process !== 'undefined' && process.env && process.env.APP_USER) || "KashRemit";
const PASSWORD = (typeof process !== 'undefined' && process.env && process.env.APP_PASSWORD) || "D91880531DC2628EF6D98799641CCE9479326B88D0F37D5269F0715DB61AD97A4CB5F802B1EB97BE98AD924E374119FD5E6E712B4DA4324E6EF9B018F22B5700";
const CHANNEL = (typeof process !== 'undefined' && process.env && process.env.APP_CHANNEL) || "03";



axiosInstance.interceptors.request.use(async function (config) {
    if (config.method !== "get") {
        // Ensure data and request are initialized
        if (!config.data) {
            config.data = {};
        }
        if (!config.data.request) {
            config.data.request = {};
        }

        // Get user from AsyncStorage
        const value = await AsyncStorage.getItem('user');
        let user: any = {};
        if (value) {
            user = JSON.parse(value);
        }

        // Now you can safely set properties
        config.data.request.Login = USER;
        config.data.request.Password = PASSWORD;

        if (user && user.RemitterID) {
            config.data.request.RemitterID = user.RemitterID;
        } else {
            config.data.request.RemitterID = null;
        }

        config.data.request.ClientCredentials = {
            Login: USER,
            Password: PASSWORD,
            ChannelType: CHANNEL,
            control: null,
            AuthenticationAgentCode: null,
            TokenID: user.TokenID,
        };
        config.data.request.DeviceInformation = {
            DeviceID: null,
            DeviceName: 'MOBILE',
            DeviceIP: "ipAddress",
            OS: "android",
            MobileNumber: null,
        };
    }

    return config;
}, function (error) {
    return Promise.reject(error);
});


export default axiosInstance;