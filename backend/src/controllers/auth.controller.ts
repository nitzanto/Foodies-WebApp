import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { googleLoginService } from "../services/auth.service";
import { getUserTokens, extractToken } from "../services/auth.service";
import User from "../interfaces/User";
import UserModel from "../models/User";
import { HttpStatusCode } from "axios";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { errorMessages } from "../utils/constants";
import { DEFAULT_IMAGE } from "../constants/constants";
import mongoose from "mongoose";

export const register = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      logger.error("Required fields werent provided.");
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Please provide all required fields" });
    }
    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : DEFAULT_IMAGE;
    const user: User = { userName, email, password, profileImage: imagePath };
    const newUser = await userService.createUser(user);
    res.status(HttpStatusCode.Created).json(newUser);
  } catch (error: any) {
    logger.error("Error creating user: ", error.message);
    if (error.message.includes("duplicate key error")) {
      return res
        .status(HttpStatusCode.Conflict)
        .json({ message: "User already exists" });
    }
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const userIdentifier = req.body.userName || req.body.email;
    const password = req.body.password;
    if (!userIdentifier || !password) {
      logger.error("All fields are required");
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: errorMessages.INVALID_CREDENTIALS });
    }
    const user = await userService.getUserByIdentifier(userIdentifier);
    if (!user) {
      logger.error("User not found");
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: errorMessages.USER_NOT_FOUND });
    }
    const isUserPasswordMatch = await userService.validatePassword(
      password,
      user.password
    );
    if (!isUserPasswordMatch) {
      logger.error("Password is incorrect");
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: errorMessages.USER_NOT_FOUND });
    }
    const tokens = await getUserTokens(user);
    logger.info("User logged in successfully");
    res.status(HttpStatusCode.Ok).json({ user, tokens });
  } catch (error: any) {
    logger.error("Error logging in: ", error.message);
    if (error.message === errorMessages.INVALID_CREDENTIALS) {
      logger.error("User not found or password is incorrect");
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: errorMessages.USER_NOT_FOUND });
    }
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = extractToken(req);
  if (!refreshToken) {
    return res
      .status(HttpStatusCode.Unauthorized)
      .json({ message: errorMessages.INVALID_TOKEN });
  }

  jwt.verify(
    refreshToken,
    process.env.TOKEN_SECRET as string,
    async (err: any, user: any) => {
      if (err) {
        return res
          .status(HttpStatusCode.Unauthorized)
          .json({ message: errorMessages.INVALID_TOKEN });
      }
      try {
        const userDb = await userService.getUserById(user._id);
        if (!userDb?.tokens || !userDb.tokens.includes(refreshToken)) {
          return res
            .status(HttpStatusCode.Unauthorized)
            .json({ message: errorMessages.FAILED_TO_GET_USER_BY_ID });
        }
        userDb.tokens = userDb.tokens.filter((token) => token !== refreshToken);
        await userDb.save();
        return res
          .status(HttpStatusCode.Ok)
          .json({ message: "User logged out successfully" });
      } catch (error: any) {
        logger.error("Error logging out: ", error.message);
        return res
          .status(HttpStatusCode.InternalServerError)
          .json({ message: error.message });
      }
    }
  );
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const user = await googleLoginService(req, res);
    logger.info("User logged in successfully");
    res.status(HttpStatusCode.Ok).json(user);
  } catch (error: any) {
    logger.error("Error logging in witn Google: ", error.message);
    if (error.message === errorMessages.INVALID_CREDENTIALS) {
      logger.error("User not found or password is incorrect");
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: errorMessages.USER_NOT_FOUND });
    }
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const accessToken = extractToken(req);
  if (!accessToken) {
    return res
      .status(HttpStatusCode.Unauthorized)
      .json({ message: errorMessages.INVALID_TOKEN });
  }
  jwt.verify(
    accessToken,
    process.env.TOKEN_SECRET as string,
    async (err: any, user: any) => {
      if (err) {
        return res
          .status(HttpStatusCode.Unauthorized)
          .json({ message: errorMessages.INVALID_TOKEN });
      }
      try {
        const userDb = await userService.getUserById(user._id);
        if (!userDb) {
          return res
            .status(HttpStatusCode.NotFound)
            .json({ message: errorMessages.FAILED_TO_GET_USER_BY_ID });
        }
        return res.status(HttpStatusCode.Ok).json(userDb);
      } catch (error: any) {
        logger.error("Error getting user: ", error.message);
        return res
          .status(HttpStatusCode.InternalServerError)
          .json({ message: error.message });
      }
    }
  );
};

export const updateUser = async (req: Request, res: Response) => {
  const userid = req.params.userId;
  const updatedUserData = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : DEFAULT_IMAGE;
  try {
    const { userName, email, password } = updatedUserData;
    if (!userName || !email || !password) {
      logger.error("Required fields werent provided.");
      return res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "Please provide all required fields" });
    }

    // convert userId to ObjectId
    const userID = new mongoose.Types.ObjectId(userid);
    const newUser = await userService.updateUser(userID, {
      userName,
      email,
      password,
      profileImage: imagePath,
    });
    res.status(HttpStatusCode.Created).json(newUser);
  } catch (error: any) {
    console.log(error.message);
    console.log(error);
    logger.error("Error updating user: ", error.message);
    if (error.message.includes("duplicate key error")) {
      logger.error("Username already in use");
      return res
        .status(HttpStatusCode.Conflict)
        .json({ message: "Username already in use" });
    }
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    const user = await userService.deleteUser(userId);
    if (!user) {
      return res
        .status(HttpStatusCode.NotFound)
        .json({ message: "User not found" });
    }
    return res
      .status(HttpStatusCode.Ok)
      .json({ message: "User deleted successfully" });
  } catch (error: any) {
    logger.error("Error deleting user: ", error.message);
    return res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message });
  }
};

export const getOnlineUsers = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    const onlineUsers = await UserModel.find(
      { socketId: { $exists: true, $ne: null }, _id: { $ne: userId } },
      "_id socketId userName"
    );

    res.send(onlineUsers);
  } catch (error) {
    console.error("Error fetching online users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const items = await UserModel.find();
    return res.send(items);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

export const updateSocketId = async (
  userId: mongoose.Types.ObjectId,
  socketId: string
) => {
  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { socketId } },
      { new: true }
    );

    if (!updatedUser) {
      console.log(`User with ID ${userId} not found.`);
    } else {
      console.log(`Socket ID ${socketId} associated with user ID ${userId}`);
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user socket ID:", error);
  }
};

export const removeSocketId = async (socketId: string) => {
  try {
    const user = await UserModel.findOneAndUpdate(
      { socketId },
      { $set: { socketId: null } },
      { new: true }
    );

    if (user) {
      console.log(`Socket ID ${socketId} removed from user ID ${user._id}`);
      return user._id;
    } else {
      console.log(`User with socket ID ${socketId} not found`);
      return null;
    }
  } catch (error) {
    console.error("Error removing user socket ID:", error);
  }
};
