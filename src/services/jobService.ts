import api from './api';

export interface Customer {
  id: number;
  customer_number: string;
  name: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id?: number;
  job_id?: number;
  name: string;
  serial_number?: string;
}

export interface TrackingDetail {
  id?: number;
  job_id?: number;
  shipping_agent_name?: string;
  tracking_number?: string;
}

export interface Job {
  id: number;
  job_number: string;
  customer_id: number;
  customer: Customer;
  company_name?: string;
  original_case_number?: string;
  clk_case_number?: string;
  lk_shipped_date?: string;
  lk_shipping_method?: string;
  supplier_shipping_method?: string;
  company_received_date?: string;
  supplier_shipping_date?: string;
  warehouse_received_date?: string;
  received_confirmation_by?: string;
  sg?: boolean;
  sg_received_by_name?: string;
  shipped_from_singapore_date?: string;
  final_received_date?: string;
  final_received_by_name?: string;
  clk_received_by_name?: string;
  received_confirmation: boolean;
  service_confirmation?: boolean;
  status: string;
  items: Item[];
  tracking_details?: TrackingDetail;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface JobFormData {
  job_number: string;
  customer_id: number;
  company_name?: string;
  original_case_number?: string;
  clk_case_number?: string;
  lk_shipped_date?: string;
  lk_shipping_method?: string;
  supplier_shipping_method?: string;
  company_received_date?: string;
  supplier_shipping_date?: string;
  warehouse_received_date?: string;
  received_confirmation_by?: string;
  sg?: boolean;
  sg_received_by_name?: string;
  shipped_from_singapore_date?: string;
  final_received_date?: string;
  final_received_by_name?: string;
  clk_received_by_name?: string;
  received_confirmation?: boolean;
  service_confirmation?: boolean;
  items?: Item[];
  tracking?: {
    shipping_agent_name?: string;
    tracking_number?: string;
  };
}

export interface AdvancedFilters {
  original_case_number?: string;
  clk_case_number?: string;
  company_name?: string;
  lk_shipped_date_from?: string;
  lk_shipped_date_to?: string;
  company_received_date_from?: string;
  company_received_date_to?: string;
  supplier_shipping_date_from?: string;
  supplier_shipping_date_to?: string;
  tracking_number?: string;
  warehouse_received_date_from?: string;
  warehouse_received_date_to?: string;
  shipped_from_sg_date_from?: string;
  shipped_from_sg_date_to?: string;
  final_received_date_from?: string;
  final_received_date_to?: string;
}

export const jobService = {
  async search(query: string, page: number = 1, status?: string, advancedFilters?: AdvancedFilters): Promise<PaginatedResponse<Job>> {
    const { data } = await api.get<PaginatedResponse<Job>>('/search', {
      params: { 
        query, 
        page, 
        status,
        ...(advancedFilters || {})
      },
    });
    return data;
  },

  async getSuggestions(query: string, limit: number = 10): Promise<{
    job_numbers: string[];
    customer_names: string[];
    phone_numbers: string[];
    original_case_numbers: string[];
    clk_case_numbers: string[];
  }> {
    const { data } = await api.get('/search/suggestions', {
      params: { query, limit },
    });
    return data;
  },

  async getJob(id: number): Promise<Job> {
    const { data } = await api.get<Job>(`/jobs/${id}`);
    return data;
  },

  async getAllJobs(page: number = 1, status?: string, advancedFilters?: AdvancedFilters): Promise<PaginatedResponse<Job>> {
    try {
      // Try the regular jobs endpoint first (for admin/data entry users)
      const { data } = await api.get<PaginatedResponse<Job>>('/jobs', {
        params: { 
          page, 
          status,
          ...(advancedFilters || {})
        },
      });
      return data;
    } catch (error: any) {
      // If forbidden (viewer role), use the search/jobs endpoint
      if (error.response?.status === 403) {
        const { data } = await api.get<PaginatedResponse<Job>>('/search/jobs', {
          params: { 
            page,
            per_page: 15
          },
        });
        return data;
      }
      throw error;
    }
  },

  async createJob(jobData: JobFormData): Promise<Job> {
    const { data } = await api.post<Job>('/jobs', jobData);
    return data;
  },

  async updateJob(id: number, jobData: Partial<JobFormData>): Promise<Job> {
    const { data } = await api.put<Job>(`/jobs/${id}`, jobData);
    return data;
  },

  async deleteJob(id: number): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },
};

export const customerService = {
  async getAllCustomers(page: number = 1): Promise<PaginatedResponse<Customer>> {
    const { data } = await api.get<PaginatedResponse<Customer>>('/customers', {
      params: { page },
    });
    return data;
  },

  async getCustomer(id: number): Promise<Customer> {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  async createCustomer(customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    const { data } = await api.post<Customer>('/customers', customerData);
    return data;
  },

  async updateCustomer(id: number, customerData: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>): Promise<Customer> {
    const { data } = await api.put<Customer>(`/customers/${id}`, customerData);
    return data;
  },

  async deleteCustomer(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};
