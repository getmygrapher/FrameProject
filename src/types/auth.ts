export type UserRole = "b2c_customer" | "b2b_partner" | "admin" | "super_admin";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  avatar_url?: string;
}

export interface B2BPartner {
  id: string;
  user_id: string;
  company_name: string;
  business_type?: string;
  tax_id?: string;
  business_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  credit_limit: number;
  payment_terms: number;
  discount_percentage: number;
  status: "pending" | "approved" | "suspended" | "rejected";
  approved_by?: string;
  approved_at?: string;
  verification_documents?: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  b2bPartner: B2BPartner | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: UserRole;
}

export interface B2BRegistrationData extends RegisterData {
  company_name: string;
  business_type?: string;
  tax_id?: string;
  business_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordUpdateData {
  password: string;
  confirmPassword: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}
