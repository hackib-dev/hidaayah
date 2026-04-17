import axios from '@/app/utils/axios';
import { API_AUTH_URL } from '@/config';

interface LoginFormData {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginFormData) => {
  const response = await axios(API_AUTH_URL).post(`/login`, data);
  return response;
};
