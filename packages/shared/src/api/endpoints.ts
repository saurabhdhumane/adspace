import { AxiosInstance } from 'axios';
import {
  ApiResponse,
  AuthResponseData,
  Banner,
  BannerQueryParams,
  Inquiry,
  NearbyBannerQueryParams,
  User,
} from '../types/index.js';

export const createApiEndpoints = (client: AxiosInstance) => ({
  // Auth
  register: async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'owner' | 'advertiser';
    company?: string;
  }) => {
    const res = await client.post<ApiResponse<AuthResponseData>>('/auth/register', payload);
    return res.data;
  },

  login: async (payload: { email: string; password: string }) => {
    const res = await client.post<ApiResponse<AuthResponseData>>('/auth/login', payload);
    return res.data;
  },

  logout: async () => {
    const res = await client.post<ApiResponse<{ message: string }>>('/auth/logout');
    return res.data;
  },

  getMe: async () => {
    const res = await client.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },

  updatePushToken: async (expoPushToken: string) => {
    const res = await client.patch<ApiResponse<User>>('/auth/push-token', { expoPushToken });
    return res.data;
  },

  // Banners
  getBanners: async (params?: BannerQueryParams) => {
    const res = await client.get<ApiResponse<Banner[]>>('/banners', { params });
    return res.data;
  },

  getNearbyBanners: async (params: NearbyBannerQueryParams) => {
    const res = await client.get<ApiResponse<Banner[]>>('/banners/nearby', { params });
    return res.data;
  },

  getBannerById: async (id: string) => {
    const res = await client.get<ApiResponse<Banner>>(`/banners/${id}`);
    return res.data;
  },

  getMyBanners: async () => {
    const res = await client.get<ApiResponse<Banner[]>>('/banners/mine');
    return res.data;
  },

  createBanner: async (data: Partial<Banner>) => {
    const res = await client.post<ApiResponse<Banner>>('/banners', data);
    return res.data;
  },

  updateBanner: async (id: string, data: Partial<Banner>) => {
    const res = await client.patch<ApiResponse<Banner>>(`/banners/${id}`, data);
    return res.data;
  },

  deleteBanner: async (id: string) => {
    const res = await client.delete<ApiResponse<{ id: string }>>(`/banners/${id}`);
    return res.data;
  },

  addBookedSlot: async (bannerId: string, slot: { from: string; to: string; note?: string }) => {
    const res = await client.post<ApiResponse<Banner>>(`/banners/${bannerId}/slots`, slot);
    return res.data;
  },

  deleteBookedSlot: async (bannerId: string, slotId: string) => {
    const res = await client.delete<ApiResponse<Banner>>(`/banners/${bannerId}/slots/${slotId}`);
    return res.data;
  },

  // Uploads
  getPresignedUploadUrl: async (filename: string, fileType: string) => {
    const res = await client.post<ApiResponse<{ uploadUrl: string; key: string; finalUrl: string }>>(
      '/uploads/presign',
      { filename, fileType }
    );
    return res.data;
  },

  // Inquiries
  createInquiry: async (payload: {
    bannerId: string;
    requestedRange: { from: string; to: string };
    message?: string;
  }) => {
    const res = await client.post<ApiResponse<Inquiry>>('/inquiries', payload);
    return res.data;
  },

  getSentInquiries: async () => {
    const res = await client.get<ApiResponse<Inquiry[]>>('/inquiries/sent');
    return res.data;
  },

  getReceivedInquiries: async () => {
    const res = await client.get<ApiResponse<Inquiry[]>>('/inquiries/received');
    return res.data;
  },

  respondToInquiry: async (
    inquiryId: string,
    payload: { status: 'accepted' | 'rejected'; ownerResponse?: string }
  ) => {
    const res = await client.patch<ApiResponse<Inquiry>>(`/inquiries/${inquiryId}/respond`, payload);
    return res.data;
  },
});
