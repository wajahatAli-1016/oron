import axios, { AxiosError } from 'axios';
import { User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL;

const getAuthToken = () => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) {
    return '';
  }

  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

const getApiBase = () => {
  if (!API_BASE) {
    throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
  }
  return API_BASE;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;
    if (typeof payload === 'string') {
      if (payload.includes('<!doctype') || payload.includes('<html')) {
        return 'Users API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
      }
      return payload || fallback;
    }
    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }
  }
  return fallback;
};

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${getApiBase()}/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload as User[];
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as User[];
      }
      if (Array.isArray(payload?.users)) {
        return payload.users as User[];
      }

      return [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch users'));
    }
  },

  async getUserById(id: string): Promise<User> {
    try {
      const response = await axios.get(`${getApiBase()}/users/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data as User;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch user'));
    }
  },
};