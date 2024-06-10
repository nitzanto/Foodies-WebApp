import fs from 'fs';
import path from 'path';
import axios from 'axios';

const reviewsFilePath = path.join(__dirname, 'reviews.json');
const options = {
    method: 'GET',
    url: 'https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchRestaurants',
        params: {
        locationId: '293984'
      },
      headers: {
        'X-RapidAPI-Key': 'f8662f8ed1msh343418130ebdb98p11bf57jsna9bf16098028',
        'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com'
      }
};

export const fetchReviews = async () => {
    try{
        const response = await axios.request(options);
        fs.writeFileSync(reviewsFilePath, JSON.stringify(response.data.data.data, null, 2));
        console.log('File written successfully');
    } catch (error) {
        console.error(error);
    }
}

export const parseReviews = () => {
    const reviews = fs.readFileSync(reviewsFilePath, 'utf-8');
    return JSON.parse(reviews);
}