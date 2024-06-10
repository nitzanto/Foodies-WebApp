import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
    _id: mongoose.Schema.Types.ObjectId;
    ownerId: mongoose.Schema.Types.ObjectId;
    userName: string; 
    title: string;
    restaurantId: mongoose.Schema.Types.ObjectId;
    content: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
    image?:{
        originalName?: string;
        serverFileName?: string;
    };
    comments?: Comment[];
}


const PostSchema: Schema = new Schema<IPost>({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true , ref: 'User'},
    title: { type: String, required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    image: {
        originalName: { type: String, required: false },
        serverFileName: { type: String, required: false }
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
});

const PostModel: Model<IPost> = mongoose.model<IPost>('Post', PostSchema);
export default PostModel;