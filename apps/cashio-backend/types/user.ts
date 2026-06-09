export type User = {
  id: string;
  email: string;
  fullName: string;
  password: string;
  phone: string;
  otpCode?: string | null;
  isVerified: boolean;
  otpExpiresAt: Date | null;
  createdAt: Date;
};
