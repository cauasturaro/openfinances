import { api } from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const UserService = {
  register: async (data: RegisterRequest) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  login: async (data: LoginRequest) => {
    const response = await api.post('/users/login', data);
    return response.data;
  }
};