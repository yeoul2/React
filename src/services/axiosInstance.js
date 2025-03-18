import axios from "axios";

const axiosInstance  = axios.create({
    baseURL: "http://localhost:7007", //백엔드 주소
    withCredentials: true, // 쿠키 포함
})

axiosInstance.interceptors.request.use(
    (config) => {
        const tokenToUse = localStorage.getItem("accessToken")

        if(tokenToUse) {
            config.headers.Authorization = `Bearer ${tokenToUse}`;
        } else {
            delete config.headers.Authorization;
        }
        return config
    },
    (error) => {
        return Promise.reject(error);
    }
)

export default axiosInstance