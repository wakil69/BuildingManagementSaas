import axios from 'axios';

export const customRequest = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
});


export default customRequest;