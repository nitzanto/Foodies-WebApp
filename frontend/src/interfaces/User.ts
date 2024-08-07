import mongoose from 'mongoose';
export interface User{
  email: string;
  password: string;
  profileImage?: string;
  userName: string;
  _id?: mongoose.Types.ObjectId;
  accessToken?: string;
  refreshToken?: string;
  createdAt: string;
}
