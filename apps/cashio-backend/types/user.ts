export type User = {
  _id: string;
  email: string;
  fullname: string;
  password: string;
  phone: string;
  otp?: number;
  isVerified: boolean;
};

