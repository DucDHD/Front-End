import axios from 'axios'

let authorizeAxiosInstance = axios.create()

authorizeAxiosInstance.defaults.timeout = 1000*60*10 // 10p

authorizeAxiosInstance.defaults.withCredentials = true

export default authorizeAxiosInstance