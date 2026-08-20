export type UserRole = 'owner' | 'advertiser';

export interface User {
  _id: string;
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  company?: string;
  avatarUrl?: string;
  isVerified: boolean;
  expoPushToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BannerType = 'bus_stand' | 'hoarding' | 'flyover_gantry' | 'unipole' | 'wall';
export type BannerIllumination = 'lit' | 'non_lit';
export type BannerStatus = 'available' | 'busy';
export type PricePer = 'day' | 'week' | 'month';

export interface BannerPhoto {
  _id?: string;
  url: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
}

export interface BannerLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city: string;
  state?: string;
  landmark?: string;
}

export interface BannerDimensions {
  width: number;
  height: number;
  unit: 'ft' | 'm';
}

export interface BannerPrice {
  amount: number;
  currency: 'INR';
  per: PricePer;
}

export interface BookedSlot {
  _id?: string;
  id?: string;
  from: string; // ISO date string
  to: string;   // ISO date string
  note?: string;
}

export interface Banner {
  _id: string;
  id: string;
  ownerId: string | User;
  title: string;
  type: BannerType;
  description?: string;
  photos: BannerPhoto[];
  location: BannerLocation;
  dimensions: BannerDimensions;
  illumination: BannerIllumination;
  trafficNotes?: string;
  price: BannerPrice;
  status: BannerStatus;
  bookedSlots: BookedSlot[];
  isActive: boolean;
  viewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export type InquiryStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface RequestedRange {
  from: string; // ISO date string
  to: string;   // ISO date string
}

export interface Inquiry {
  _id: string;
  id: string;
  bannerId: string | Banner;
  advertiserId: string | User;
  ownerId: string | User;
  requestedRange: RequestedRange;
  message?: string;
  status: InquiryStatus;
  ownerResponse?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface BannerQueryParams {
  city?: string;
  type?: BannerType;
  minPrice?: number;
  maxPrice?: number;
  illumination?: BannerIllumination;
  availableNow?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface NearbyBannerQueryParams {
  lng: number;
  lat: number;
  radiusKm?: number;
}
