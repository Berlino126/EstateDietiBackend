import axios from "axios";

const apiRequest = axios.create({
  //baseURL: "http://35.181.57.245:443/api",
  baseURL: "http://localhost:8800/api",
  withCredentials: true,
});

export default apiRequest;