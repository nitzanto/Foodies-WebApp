import Comment from './Comment';
import mongoose from 'mongoose';
interface Post{
    ownerId: string;
    userName: string;
    title: string;
    restaurantId: string;
    content: string;
    rating: number;
    image?:{
        originalName?: string;
        serverFileName?: string;
    };
    comments?: Comment[];
}

export default Post;