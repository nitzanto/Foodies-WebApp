import RestaurantModel, { IRestaurant } from "../models/Restaurant";
import logger from "../utils/logger";
import mongoose from "mongoose";
import Restaurant from '../interfaces/Restaurant';
import { errorMessages } from '../utils/constants';

export const createRestaurant = async (restaurant: Restaurant): Promise<IRestaurant> => {
  const existingRestaurant = await RestaurantModel.findOne({name: restaurant.name});
  if (existingRestaurant)
    throw new Error(errorMessages.RESTAURANT_ALREADY_EXISTS);

  try {
    const newRestaurant = new RestaurantModel({
      name: restaurant.name,
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state,
      averageRating: restaurant.averageRating,
      userReviewCount: restaurant.userReviewCount,
      cuisine: restaurant.cuisine,
      reviews: restaurant.reviews,
      openingHours: restaurant.openingHours
    });
    const savedRestaurant = await newRestaurant.save();
    return savedRestaurant;
  } catch (error: any) {
    logger.error(`Error creating restaurant: ${error.message}`);
    throw new Error(errorMessages.FAILED_TO_CREATE_RESTAURANT);
  }
};

export const getRestaurantByName = async (name: string) => {
  try {
    const restaurant = await RestaurantModel.findOne({
      name: name,
    });
    return restaurant;
  } catch (error: any) {
    logger.error(`Error getting restaurant by name: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_NAME);
  }
};

export const getRestaurantByCity = async (city: string) => {
  try {
    const restaurant = await RestaurantModel.find({
      city: city,
    });
    return restaurant;
  } catch (error: any) {
    logger.error(`Error getting restaurant by city: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_CITY);
  }
};

export const getRestaurantByRating = async (rating: number) => {
  try {
    const restaurant = await RestaurantModel.find({
      averageRating: {$gte: rating},
    });
    return restaurant;
  } catch (error: any) {
    logger.error(`Error getting restaurant by rating: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_RATING);
  }
};

export const updateRestaurantByCuisine = async (name: string, cuisine: string[]) => {
  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
      { name: name },
      { cuisine: cuisine },
      { new: true }
    );
    return updatedRestaurant;
  } catch (error: any) {
    logger.error(`Error updating restaurant by cuisine: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_NAME);
  }
};

export const updateRestaurantByHours = async (name: string, hours: string) => {
  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
      { name: name },
      { openingHours: hours },
      { new: true }
    );
    return updatedRestaurant;
  } catch (error: any) {
    logger.error(`Error updating restaurant by hours: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_NAME);
  }
};

export const updateRestaurantByRating = async (name: string, rating: number) => {
  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
      { name: name },
      { averageRating: rating },
      { new: true }
    );
    return updatedRestaurant;
  } catch (error: any) {
    logger.error(`Error updating restaurant by rating: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_NAME);
  }
}

export const updateRestaurantByReviews = async (name: string, reviews: string[]) => {
  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
      { name: name },
      { reviews: reviews },
      { new: true }
    );
    return updatedRestaurant;
  } catch (error: any) {
    logger.error(`Error updating restaurant by reviews: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_NAME);
  }
};

export const deleteRestaurant = async (identifier: string): Promise<IRestaurant | null> => {
  try{
    const deletedRestaurant = await RestaurantModel.findOneAndDelete({
      $or: [{name: identifier}],
    });
    // logger.info(`Deleted Restaurant: ${deletedRestaurant}`);
    return deletedRestaurant;
  } catch (error){
    logger.error(`Error Deleteing restaurant by name or id: ${error}`);
    throw new Error(errorMessages.ERROR_DELETING_RESTAURANT);
  }
}

export default {createRestaurant, 
  getRestaurantByName,
  getRestaurantByCity,
  getRestaurantByRating,
  updateRestaurantByCuisine,
  updateRestaurantByHours,
  updateRestaurantByRating,
  updateRestaurantByReviews,
  deleteRestaurant
};