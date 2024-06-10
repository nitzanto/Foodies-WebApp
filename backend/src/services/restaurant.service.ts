import RestaurantModel, { IRestaurant } from "../models/Restaurant";
import logger from "../utils/logger";
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
    logger.info(`Restaurant by name ${name}: ${restaurant}`);
    return restaurant;
  } catch (error: any) {
    logger.error(`Error getting restaurant by name: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_NAME);
  }
};

export const getRestaurantsByCity = async (city: string) => {
  try {
    const restaurant = await RestaurantModel.find({
      city: city,
    });
    logger.info(`Restaurants in ${city}: ${restaurant}`);
    return restaurant;
  } catch (error: any) {
    logger.error(`Error getting restaurant by city: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_CITY);
  }
};

export const getRestaurantsByRating = async (rating: number) => {
  try {
    const restaurant = await RestaurantModel.find({
      averageRating: {$gte: rating},
    });
    logger.info(`Restaurants with rating above ${rating}: ${restaurant}`);
    return restaurant;
  } catch (error: any) {
    logger.error(`Error getting restaurant by rating: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_RATING);
  }
};

export const updateRestaurantCuisine = async (name: string, cuisine: string[]) => {
  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
      { name: name },
      { cuisine: cuisine },
      { new: true }
    );
    logger.info(`Updated restaurant: ${updatedRestaurant}, cuisine ${cuisine}`);
    return updatedRestaurant;
  } catch (error: any) {
    logger.error(`Error updating restaurant by cuisine: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_NAME);
  }
};

export const updateRestaurantHours = async (name: string, hours: string) => {
  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
      { name: name },
      { openingHours: hours },
      { new: true }
    );
    logger.info(`Updated restaurant: ${updatedRestaurant}, hours ${hours}`);
    return updatedRestaurant;
  } catch (error: any) {
    logger.error(`Error updating restaurant by hours: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_NAME);
  }
};

export const updateRestaurantRating = async (name: string, rating: number) => {
  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
      { name: name },
      { averageRating: rating },
      { new: true }
    );
    logger.info(`Updated restaurant: ${updatedRestaurant}, rating ${rating}`);
    return updatedRestaurant;
  } catch (error: any) {
    logger.error(`Error updating restaurant by rating: ${error.message}`);
    throw new Error(errorMessages.NOT_FOUND_RESTAURANT_NAME);
  }
}

export const updateRestaurantReviews = async (name: string, reviews: string[]) => {
  try {
    const updatedRestaurant = await RestaurantModel.findOneAndUpdate(
      { name: name },
      { reviews: reviews },
      { new: true }
    );
    logger.info(`Updated restaurant: ${updatedRestaurant}, reviews ${reviews}`);
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
    logger.info(`Deleted Restaurant: ${deletedRestaurant}`);
    return deletedRestaurant;
  } catch (error){
    logger.error(`Error Deleteing restaurant by name or id: ${error}`);
    throw new Error(errorMessages.ERROR_DELETING_RESTAURANT);
  }
}
