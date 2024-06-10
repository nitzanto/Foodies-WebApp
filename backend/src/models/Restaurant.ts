import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRestaurant extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    address: string; // derive from locationId
    city: string;   // derive from parentGeoName
    state: string;  // derive from parentGeoName
    averageRating: number;
    userReviewCount?: number;
    cuisine?: string[];
    reviews: string[];
    openingHours: string;
}

const RestaurantSchema: Schema = new Schema<IRestaurant>({
    name: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    averageRating: { type: Number, required: true },
    userReviewCount: { type: Number },
    cuisine: { type: [String] },
    openingHours: { type: String, required: true },
    reviews: { type: [String], required: true }
});

const RestaurantModel: Model<IRestaurant> = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
export default RestaurantModel;