import PostModel, {IPost} from "@models/Post";
import logger from "@utils/logger";
import Post from '@interfaces/Post';
import Comment from '@interfaces/Comment';
import { createComment } from '@services/comment.service';
import { errorMessages } from '@utils/constants';

export const createPost = async (post: Post): Promise<IPost> => {
    const existingPost = await PostModel.findOne({title: post.title});
    if (existingPost)
        throw new Error(errorMessages.POST_ALREADY_EXISTS);
    try {
        const newPost = new PostModel({
            ownerId: post.ownerId,
            userName: post.userName,
            title: post.title,
            restaurantId: post.restaurantId,
            content: post.content,
            rating: post.rating,
            image: post.image,
            // comments: post.comments,
        });
        const savedPost = await newPost.save();
        return savedPost;
    } catch (error: any) {
        logger.error(`Error creating post: ${error.message}`);
        console.log(error.message);
        throw new Error(errorMessages.FAILED_TO_CREATE_POST);
    }
};

export const getPostByTitle = async (title: string) =>{
    try{
        const post = await PostModel.findOne({
            title: title,
        });
        logger.info(`Post by title ${title}: ${post}`);
        return post;
    } catch( error: any){
        logger.error(`Error getting post by title: ${error.message}`);
        throw new Error(errorMessages.NOT_FOUND_POST_TITLE);
    }
};

export const getPostsByUsername = async (userName: string) =>{
    try{
        const post = await PostModel.find({
            userName: userName,
        });
        logger.info(`Posts by ${userName}: ${post}`);
        return post;
    } catch( error: any){
        logger.error(`Error getting post by username: ${error.message}`);
        throw new Error(errorMessages.NOT_FOUND_POST_USER_NAME);
    }
};

export const getPostsByRating = async (rating: number) =>{
    try{
        const post = await PostModel.find({
            rating: {$gte: rating},
        });
        logger.info(`Posts with rating above ${rating}: ${post}`);
        return post;
    } catch( error: any){
        logger.error(`Error getting post by rating: ${error.message}`);
        throw new Error(errorMessages.NOT_FOUND_POST_RATING);
    }
};

export const updatePostTitle = async (userName: string, newTitle: string) =>{
    try{
        const updatedPost = await PostModel.findOneAndUpdate(
            {userName: userName},
            {title: newTitle},
            {new: true}
        );
        logger.info(`Updated post: ${updatedPost}, title ${newTitle}`);
        return updatedPost;
    } catch( error: any){
        logger.error(`Error updating post by title: ${error.message}`);
        throw new Error(errorMessages.FAILED_TO_UPDATE_POST);
    }
};

export const updatePostRating = async (userName: string, newRating: number) =>{
    try{
        const updatedPost = await PostModel.findOneAndUpdate(
            {userName: userName},
            {rating: newRating},
            {new: true}
        );
        logger.info(`Updated post: ${updatedPost}, rating ${newRating}`);
        return updatedPost;
    } catch( error: any){
        logger.error(`Error updating post by rating: ${error.message}`);
        throw new Error(errorMessages.FAILED_TO_UPDATE_POST);
    }
};

export const updatePostContent = async (userName: string, newContent: string) =>{
    try{
        const updatedPost = await PostModel.findOneAndUpdate(
            {userName: userName},
            {content: newContent},
            {new: true}
        );
        logger.info(`Updated post: ${updatedPost}, content ${newContent}`);
        return updatedPost;
    } catch( error: any){
        logger.error(`Error updating post by content: ${error.message}`);
        throw new Error(errorMessages.FAILED_TO_UPDATE_POST);
    }
};

export const deletePost = async (identifier: string) : Promise<IPost | null> =>{
    try{
        const deletedPost = await PostModel.findOneAndDelete({
            $or: [
                {title: identifier},
                {userName: identifier}
            ]
        });
        logger.info(`Deleted post: ${deletedPost}`);
        return deletedPost;
    } catch( error: any){
        logger.error(`Error deleting post by title or username: ${error.message}`);
        throw new Error(errorMessages.FAILED_TO_DELETE_POST);
    }
};
