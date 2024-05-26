import mongoose, { connect } from 'mongoose';
import TripAdvisorService from '../../services/tripadvisorAPI.service';
import {createRestaurant, 
        getRestaurantByName,
        getRestaurantByCity,
        getRestaurantByRating,
        updateRestaurantByCuisine,
        updateRestaurantByHours,
        updateRestaurantByRating,
        updateRestaurantByReviews,
        deleteRestaurant
       } from '../../services/restaurant.service';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import request from 'supertest';
import connectToDatabase from '../../utils/dbConfig';
import  RestaurantModel, { IRestaurant } from '../../models/Restaurant';
import Restaurant from '../../interfaces/Restaurant';


const testRestaurant: Restaurant = {
    // _id: '12345',
    name: 'Restaurant1',
    address: 'HaMerkava 4',
    city: 'Tel Aviv',
    state: 'Israel',
    averageRating: 2.5,
    userReviewCount: 2,
    cuisine: ['Italian', 'Mexican'],
    reviews: ['great', 'cool'],
    openingHours: '10:00 - 16:00',
} as const;

const testRestaurant2: Restaurant = {
    // _id: '12346',
    name: 'Restaurant2',
    address: 'HaTank 5',
    city: 'Tel Aviv',
    state: 'Israel',
    averageRating: 4.7,
    userReviewCount: 3,
    cuisine: ['Italian', 'Mexican', 'Japanese'],
    reviews: ['tasty', 'nice', 'Bazinga'],
    openingHours: '08:00 - 19:00',
} as const;


const assertRestaurant = (newRestaurant: IRestaurant | null, expectedRestaurant: Restaurant) => {
    expect(newRestaurant).toBeDefined();
    expect(newRestaurant).toHaveProperty('_id', expect.any(mongoose.Types.ObjectId));
    expect(newRestaurant).toHaveProperty('name', expectedRestaurant.name);
    expect(newRestaurant).toHaveProperty('address', expectedRestaurant.address);
    expect(newRestaurant).toHaveProperty('city', expectedRestaurant.city);
    expect(newRestaurant).toHaveProperty('state', expectedRestaurant.state);
    expect(newRestaurant).toHaveProperty('averageRating', expectedRestaurant.averageRating);
    expect(newRestaurant).toHaveProperty('userReviewCount', expectedRestaurant.userReviewCount);
    expect(newRestaurant).toHaveProperty('cuisine', expectedRestaurant.cuisine);
    expect(newRestaurant).toHaveProperty('reviews', expectedRestaurant.reviews);
    expect(newRestaurant).toHaveProperty('openingHours', expectedRestaurant.openingHours);
}


describe('Restaurant Service', () => {
    beforeAll(async ()=> {
        connectToDatabase();
    });
    
    afterAll(async ()=>{
        await mongoose.connection.close();
    });
    
    afterEach(async ()=>{
        await RestaurantModel.deleteMany({});
    });

    const assertRestaurants = (newRestaurants: IRestaurant[] | null, expectedRestaurants: Restaurant[]) => {
        if (newRestaurants && expectedRestaurants) {

            newRestaurants.forEach((newRes, index) => {
                const expRes = expectedRestaurants[index];
                if(!(newRes && expRes)){
                    console.log(`newRes at index ${index} is undefined.`);
                    return;
                }
                assertRestaurant(newRes, expRes);
            });
        }
    }

    describe('Create Restaurant (C)', ()=>{
        test('should create a new restaurant with testRestaurant', async () =>{
            const newRestaurant = await createRestaurant(testRestaurant);
            assertRestaurant(newRestaurant, testRestaurant);
        });
        
        test("should throw an error if restaurant already exists", async () =>{
            await createRestaurant(testRestaurant);
            await expect(createRestaurant(testRestaurant)).rejects.toThrow(Error);
        });
        
        test("should throw an error if restaurant name is taken", async () =>{
            await createRestaurant(testRestaurant);
            const takenNameRestaurant = {
                name: testRestaurant.name,
                address: 'HaMerkava 4',
                city: 'Tel Aviv',
                state: 'Israel',
                averageRating: 4.5,
                openingHours: '10:00 - 16:00',
                reviews: ['great', 'cool']
            };
            await expect(createRestaurant(takenNameRestaurant)).rejects.toThrow(Error);
        });
    });

    describe('Get Restaurant (R)', () => {
        test('should return restaurant by name', async () =>{
            await createRestaurant(testRestaurant);
            const restaurantByName = await getRestaurantByName(testRestaurant.name);
            assertRestaurant(restaurantByName, testRestaurant);
        });
        
        test('should return restaurant by city', async () =>{
            await createRestaurant(testRestaurant);
            await createRestaurant(testRestaurant2);
            const restaurantByCity: IRestaurant[] = await getRestaurantByCity(testRestaurant.city);
            expect(restaurantByCity).toBeDefined();
            expect(restaurantByCity).toHaveLength(2);
            assertRestaurants(restaurantByCity, [testRestaurant, testRestaurant2]);
        });

        test('should return restaurant by rating above 4.3', async () =>{
            await createRestaurant(testRestaurant);
            await createRestaurant(testRestaurant2);
            const restaurantByRating: IRestaurant[] = await getRestaurantByRating(2.4);
            expect(restaurantByRating).toBeDefined();
            expect(restaurantByRating).toHaveLength(2);
            expect(restaurantByRating[0]).toHaveProperty('averageRating', 2.5);
            expect(restaurantByRating[1]).toHaveProperty('averageRating', 4.7);
            assertRestaurant(restaurantByRating[0], testRestaurant);
            assertRestaurant(restaurantByRating[1], testRestaurant2);
        });

        test('should return null if restaurant is not found', async () => {
            const name = 'nonexistent';
            const restaurant = await getRestaurantByName(name);

            expect(restaurant).toBeNull();
        });

    });

    describe('Update Restaurant (U)', () => {
        test('should update restaurant rating', async () => {
            const newRestaurant = await createRestaurant(testRestaurant);
            const updatedRestaurant = await updateRestaurantByRating(newRestaurant.name, 4.5);
            expect(updatedRestaurant).toBeDefined();
            expect(updatedRestaurant).toHaveProperty('name', newRestaurant.name);
            expect(updatedRestaurant).toHaveProperty('averageRating', 4.5);
        });

        test('should update restaurant cuisine', async () => {
            const newRestaurant = await createRestaurant(testRestaurant);
            const updatedRestaurant = await updateRestaurantByCuisine(newRestaurant.name, ['Italian', 'Mexican', 'Japanese']);
            expect(updatedRestaurant).toBeDefined();
            expect(updatedRestaurant).toHaveProperty('name', newRestaurant.name);
            expect(updatedRestaurant).toHaveProperty('cuisine', ['Italian', 'Mexican', 'Japanese']);
        });

        test('should update restaurant hours', async () => {
            const newRestaurant = await createRestaurant(testRestaurant);
            const updatedRestaurant = await updateRestaurantByHours(newRestaurant.name, '08:00 - 19:00');
            expect(updatedRestaurant).toBeDefined();
            expect(updatedRestaurant).toHaveProperty('name', newRestaurant.name);
            expect(updatedRestaurant).toHaveProperty('openingHours', '08:00 - 19:00');
        });

        test('should update restaurant reviews', async () => {
            const newRestaurant = await createRestaurant(testRestaurant);
            const updatedRestaurant = await updateRestaurantByReviews(newRestaurant.name, ['tasty', 'nice', 'Bazinga']);
            expect(updatedRestaurant).toBeDefined();
            expect(updatedRestaurant).toHaveProperty('name', newRestaurant.name);
            expect(updatedRestaurant).toHaveProperty('reviews', ['tasty', 'nice', 'Bazinga']);
        });
    });

    describe('Delete Restaurant (D)', () => {
        test('should delete an existing restaurant', async () => {
            const newRestaurant = await createRestaurant(testRestaurant);
            const deletedRestaurant = await deleteRestaurant(newRestaurant.name);
            expect(deletedRestaurant).toBeDefined();
            expect(deletedRestaurant).toHaveProperty('name', newRestaurant.name);
            expect(deletedRestaurant).toHaveProperty('address', newRestaurant.address);
            expect(deletedRestaurant).toHaveProperty('city', newRestaurant.city);
            expect(deletedRestaurant).toHaveProperty('state', newRestaurant.state);
            expect(deletedRestaurant).toHaveProperty('averageRating', newRestaurant.averageRating);
            expect(deletedRestaurant).toHaveProperty('openingHours', newRestaurant.openingHours);
            expect(deletedRestaurant).toHaveProperty('reviews', newRestaurant.reviews);

            const deletedRestaurantCheck = await getRestaurantByName(newRestaurant.name);
            expect(deletedRestaurantCheck).toBeNull();
        });

        test('should return null if restaurant to delete is not found', async () => {
            const nonExistentId = '12345';
            const deletedRestaurant = await deleteRestaurant(nonExistentId);
            expect(deletedRestaurant).toBeNull();
        });
    });
});