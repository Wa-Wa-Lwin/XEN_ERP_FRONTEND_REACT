import axios from 'axios';

export interface PackagingData {
  packageID: string;
  package_type: string;
  package_type_name: string;
  package_purpose: string;
  package_length: string;
  package_width: string;
  package_height: string;
  package_dimension_unit: string;
  package_weight: string;
  package_weight_unit: string;
  remark: string | null;
  created_by_user_name: string;
  created_by_user_id: string;
  created_at: string;
  updated_by_user_name: string;
  updated_by_user_id: string;
  updated_at: string;
  active: string;
}

export interface PackagingResponse {
  all_Packaging: PackagingData[];
  all_active_Packaging: PackagingData[];
  all_inactive_Packaging: PackagingData[];
  all_Packaging_count: number;
}

export interface CreatePackagingPayload {
  package_type: string;
  package_type_name: string;
  package_purpose: string;
  package_length: number;
  package_width: number;
  package_height: number;
  package_dimension_unit: string;
  package_weight: number;
  package_weight_unit: string;
  remark?: string;
  user_name: string;
  user_id: number;
}

export interface UpdatePackagingPayload extends CreatePackagingPayload {}

export interface InactivePackagingPayload {
  active: number;
  updated_userID: number;
  updated_user_name: string;
}

const packagingService = {
  getAllPackaging: async (): Promise<PackagingResponse> => {
    const response = await axios.get(import.meta.env.VITE_APP_GET_ALL_PACKAGING);
    return response.data;
  },

  createPackaging: async (payload: CreatePackagingPayload) => {
    const response = await axios.post('/api/logistics/common/createPackaging', payload);
    return response.data;
  },

  updatePackaging: async (id: string, payload: UpdatePackagingPayload) => {
    const response = await axios.put(`/api/logistics/common/updatePackaging/${id}`, payload);
    return response.data;
  },

  inactivePackaging: async (id: string, payload: InactivePackagingPayload) => {
    const response = await axios.put(`/api/logistics/common/inactivePackaging/${id}`, payload);
    return response.data;
  },
};

export default packagingService;
