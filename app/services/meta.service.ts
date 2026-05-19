import axiosInstance from "../interceptor/axios.interceptor";
import {
    GET_COUNTRY_LIST,
    GET_NATIONALITY_LIST,
    GET_OPERATORS,
    GET_PRODUCTS,
    GET_SERVICE_PROVIDER,
    GET_SOI,
} from "../routes/api.routes";
import { User } from "../http-services/models/request//user.model";
import { NotificationTypes } from "../enums/notificationTypes";
import { Login } from "../http-services/models/request/login.model";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from "react-native-toast-message";
import { StatusCodeEnum } from "app/enums/statusCode.enum";

export interface IDropdownOption {
    label: any;
    value: any;
    optionalFilterProp?: string;
}


export class MetaService {
  static GetOperators(req: { country_iso_code: string; }): any {
    throw new Error("Method not implemented.");
  }
    static fetchCountryMetas(
        isFromCountry: boolean = false,
        isToCountry: boolean = false,
        isAirtime: boolean = false,
        onSuccess: Function,
        onError: Function,
        onFinal: () => void
    ) {
        const countryJSON = {
            request: {
                CountryDetail: {
                    Alpha_3_Code: null,
                    Is_FromCountry: isFromCountry ? "Y" : null,
                    Is_ToCountry: isToCountry ? isAirtime ? "A" :"Y" : null,
                },
            },
        };
        return axiosInstance
            .post(GET_COUNTRY_LIST, countryJSON)
            .then((response) => {
                if (
                    response.data &&
                    response.data.StatusCode === StatusCodeEnum.SUCCESS
                ) {
                    const countries = response.data["CountryDetail"] ;
                    onSuccess(countries);
                } else { 
                    Toast.show({
                        type: NotificationTypes.ERROR,
                        text1: "Fetch country failed",
                        text2: response.data.StatusMsg
                    });
                }
            })
            .catch((error) => {
                onError(error);
            })
            .finally(onFinal);
    }

   static fetchCountryMeta(
    isFromCountry: boolean = false,
    isToCountry: boolean = false,
    isAirtime: boolean = false,
    onSuccess: (countries: any) => void,
    onError: (error: any) => void,
    onFinal: () => void
  ) {
    const countryDetail = {
      Alpha_3_Code: null,
      Is_FromCountry: isFromCountry ? isAirtime ? "A" :"Y" : "Y",
      Is_ToCountry: isToCountry ? (isAirtime ? "A" : null) : null,
    };

    const countryJSON = {
      request: {
        CountryDetail: countryDetail
      }
    };

    // ✅ Log the exact payload
    console.log("Request Payload:", JSON.stringify(countryDetail, null, 2));

    // ✅ Make the API request
    return axiosInstance
      .post(GET_COUNTRY_LIST, countryJSON)
      .then((response) => {
        const data = response.data;

        if (data && data.StatusCode === StatusCodeEnum.SUCCESS) {
          const countries = data.CountryDetail;
          onSuccess(countries);
        } else {
          Toast.show({
            type: NotificationTypes.ERROR,
            text1: "Fetch country failed",
            text2: data?.StatusMsg || "Unknown error",
          });
        }
      })
      .catch((error) => {
        onError(error);
      })
      .finally(() => {
        onFinal();
      });
  }

}
