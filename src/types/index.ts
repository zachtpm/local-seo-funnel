export interface FormData {
  firstName: string;
  lastName: string;
  city: string;
  businessName: string;
  placeId: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  email: string;
  userPhone: string;
}

export interface Business {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
}
