import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types/api.types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        return response;
      },
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.error?.message || error.message || 'An error occurred',
          status: error.response?.status,
          code: error.response?.data?.error?.code || error.code,
        };

        console.error('API Error:', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(endpoint: string, params?: any): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(endpoint, { params });
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data!;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(endpoint, data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data!;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(endpoint, data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data!;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(endpoint);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data!;
  }
}

export const apiService = new ApiService();