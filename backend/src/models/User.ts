import mongoose, { Schema, Document, Model } from 'mongoose';
import validator from 'validator';

const isEmail = validator.isEmail;

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;             
  userName: string;
  email: string;
  password: string;
  profilePicture: string;
  tokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: [isEmail, 'Invalid email'],
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default:
      'https://www.iprcenter.gov/image-repository/blank-profile-picture.png/@@images/image.png',
  },
  tokens: {
    type: [String],
    default: [],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default UserModel;
