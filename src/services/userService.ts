import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
}

export const userService = {
  getAllUsers: async (page: number = 1) => {
    const response = await api.get(`/users?page=${page}`);
    return response.data;
  },

  getUser: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data: UserFormData) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: UserFormData) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};
