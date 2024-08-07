import UserModel, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import User from '../interfaces/User';
import logger from '../utils/logger';
import { errorMessages } from '../utils/constants';
import isUserFormDataValid from '../utils/isUserFormDataValid';
import mongoose from 'mongoose';

export const createUser = async (user: User): Promise<IUser> => {

  const existingUser = await UserModel.findOne({
    $or: [{ email: user.email }, { userName: user.userName }]
  });
  
  if (existingUser) {
    if (existingUser.email === user.email) {
      throw new Error(errorMessages.EMAIL_ALREADY_EXISTS);
    }
    if (existingUser.userName === user.userName) {
      throw new Error(errorMessages.USERNAME_ALREADY_EXISTS);
    }
  }

  // console.log('user', user);
  if (!isUserFormDataValid(user)) {
    throw new Error(errorMessages.INVALID_FORM_DATA);
  }

  try {
    const salt = await bcrypt.genSalt(
      parseInt(process.env.SALT_ROUNDS as string)
    );
    const hashedPassword = await bcrypt.hash(user.password, salt);
    const newUser = new UserModel({
      userName: user.userName,
      email: user.email,
      password: hashedPassword,
      profileImage: user.profileImage,
    });
    const savedUser = await newUser.save();
    return savedUser;
  } catch (error: any) {
    logger.error(`Error creating user: ${errorMessages.FAILED_TO_CREATE_USER}`);
    throw new Error(`failed to create user: ${errorMessages.FAILED_TO_CREATE_USER}`);
  }
};

export const getUserByIdentifier = async (identifier: string) => {
  try {
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { userName: identifier }],
    });
    return user;
  } catch (error: any) {
    logger.error(`Error getting user by identifier: ${error.message}`);
    throw new Error(errorMessages.FAILED_TO_GET_USER_BY_IDENTIFIER);
  }
};

export const getUserById = async (id: mongoose.Types.ObjectId) => {
  try {
    const user = await UserModel.findById(id);
    return user;
  } catch (error: any) {
    logger.error(`Error getting user by id: ${error.message}`);
    throw new Error(errorMessages.FAILED_TO_GET_USER_BY_ID);
  }
};

export const validatePassword = async (
  password: string,
  userPassword: string
) => {
  try {
    const isMatch = await bcrypt.compare(password, userPassword);
    return isMatch;
  } catch (error) {
    logger.error(`Error validating password: ${error}`);
    throw new Error(errorMessages.INVALID_CREDENTIALS);
  }
};

export const updateUser = async (
  _id: mongoose.Types.ObjectId,
  user: User
): Promise<User | null> => {
  const salt = await bcrypt.genSalt(
    parseInt(process.env.SALT_ROUNDS as string)
  );
  const hashedPassword = await bcrypt.hash(user.password, salt);
  try {
    const updatedUser = await UserModel.findByIdAndUpdate({ _id },
      {
        userName: user.userName,
        email: user.email,
        password: hashedPassword,
        profileImage: user.profileImage,
      },
      { new: true }
    );
    return updatedUser;
  } catch (error: any) {
    logger.error(`Error updating user by email or username: ${error.message}`);
    throw new Error(errorMessages.FAILED_TO_UPDATE_USER);
  }
};

export const deleteUser = async (identifier: string): Promise<boolean> => {
  try {
    const deletedUser = await UserModel.findOneAndDelete({
      $or: [{ email: identifier }, { userName: identifier }],
    });
    return !!deletedUser;
  } catch (error) {
    logger.error(`Error deleting user by email or username: ${error}`);
    throw new Error(errorMessages.FAILED_TO_DELETE_USER);
  }
};
