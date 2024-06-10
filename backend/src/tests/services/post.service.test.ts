import mongoose from 'mongoose';
import {
    createPost,
    getPostByTitle,
    getPostsByUsername,
    getPostsByRating,
    updatePostTitle,
    updatePostRating,
    updatePostContent,
    deletePost
} from '../../services/post.service';

import connectToDatabase from '@utils/dbConfig';
import PostModel, {IPost} from '@models/Post';
import Post from '@interfaces/Post';
import Comment from '@interfaces/Comment';

const testComment: Comment = {
    postId: '661c55bb863a38d93ac632cc',
    userId: '661c55bb863a38d93ac632cd',
    userName: 'User1',
    content: 'This is a great restaurant',
} as const;

const testComment2: Comment = {
    postId: '661c55bb863a38d93ac63zzz',
    userId: '661c55bb863a38d93ac632aa',
    userName: 'User2',
    content: 'This is a wonderful place to eat',
} as const;


const testPost: Post = {
    userName: 'User1',
    title: 'Best Restaurant',
    restaurantId: '661c55bb863a38d93ac632cb',
    ownerId: '661c55bb863a38d93ac632cd',
    content: 'This is the best restaurant in town',
    rating: 4.5,
    image: {
        originalName: '../../libs/data/image123.jpg',
        serverFileName: 'image123.jpg'
    },
    comments: [testComment],
} as const;


const testPost2: Post = {
    userName: 'User1',
    title: 'Very good place',
    restaurantId: '661c55bb863a38d93ac632cb',
    ownerId: '661c55bb863a38d93ac632aa',
    content: 'Very good place for Hambur-Pizza',
    rating: 3.7,
    image: {
        originalName: '../../libs/data/image123.jpg',
        serverFileName: 'image123.jpg'
    },
    comments: [testComment2],
} as const;



const assertPost = (newPost: IPost | null, expectedPost: Post) => {
    expect(newPost).toBeDefined();
    expect(newPost).toHaveProperty('_id', expect.any(mongoose.Types.ObjectId));
    expect(newPost).toHaveProperty('userName', expectedPost.userName);
    expect(newPost).toHaveProperty('title', expectedPost.title);
    expect(newPost?.restaurantId.toString()).toBe(expectedPost.restaurantId);
    expect(newPost?.ownerId.toString()).toBe(expectedPost.ownerId);
    expect(newPost).toHaveProperty('content', expectedPost.content);
    expect(newPost).toHaveProperty('image', expectedPost.image);
    // expect(newPost).toHaveProperty('comments', expectedPost.comments);
};

const assertPosts = (newPosts: IPost[] | null, expectedPosts: Post[]) => {
    if(newPosts && expectedPosts){
        newPosts.forEach((newPost, index) => {
            const expPost = expectedPosts[index];
            if(!(newPost && expPost)){
                console.log(`newPost at index ${index} is undefined.`);
                return;
            }
            assertPost(newPost, expPost);
        });
    };
};

describe('Post Service', () => {
    beforeAll(async ()=> {
        connectToDatabase();
    });
    
    afterAll(async ()=>{
        await mongoose.connection.close();
    });
    
    afterEach(async ()=>{
        await PostModel.deleteMany({});
    });

    describe('Create Post (C)', () => {

        test('should create a new post with testPost', async () => {
            const newPost = await createPost(testPost);
            assertPost(newPost, testPost);
        });

        test('should throw an error if post already exists', async () => {
            await createPost(testPost);
            await expect(createPost(testPost)).rejects.toThrow(Error);
        });

        test('should throw an error if post title is taken', async () => {
            await createPost(testPost);
            const takenTitlePost = {
                userName: 'User2',
                title: testPost.title,
                restaurantId: '123',
                ownerId: '661c5',
                content: 'This is a different post',
                rating: 4.1,
                image: {
                    originalName: '../../libs/data/image123.jpg',
                    serverFileName: 'image123.jpg'
                },
                // comments: testPost.comments,
            } as const;
            await expect(createPost(takenTitlePost)).rejects.toThrow(Error);
        });
    });

    describe('Get Post (R)', () => {
        test('should return post by title', async () => {
            await createPost(testPost);
            const postById = await getPostByTitle(testPost.title);
            assertPost(postById, testPost);
        });

        test('should return post by username', async () => {
            await createPost(testPost);
            await createPost(testPost2);
            const postByUserName: IPost[] = await getPostsByUsername(testPost.userName);
            expect(postByUserName).toBeDefined();
            expect(postByUserName).toHaveLength(2);
            assertPosts(postByUserName, [testPost, testPost2]);
        });

        test('should return posts by rating above 3.4', async () => {
            await createPost(testPost);
            await createPost(testPost2);
            const postsByRating: IPost[] = await getPostsByRating(3.4);
            expect(postsByRating).toBeDefined();
            expect(postsByRating).toHaveLength(2);
            expect(postsByRating[0]).toHaveProperty('rating', 4.5);
            expect(postsByRating[1]).toHaveProperty('rating', 3.7);
            assertPost(postsByRating[0], testPost);
            assertPost(postsByRating[1], testPost2);
        });

        test('should return null if post is not found', async () => {
            const title = 'nonexistent';
            const post = await getPostByTitle(title);

            expect(post).toBeNull();
        });
    });

    describe("Update Post (U)", () => {
        test('should update post title', async () => {
            const newPost = await createPost(testPost);
            const updatedPost = await updatePostTitle(newPost.userName, "Excellent Restaurant");
            expect(updatedPost).toBeDefined();
            expect(updatedPost).toHaveProperty('userName', newPost.userName);
            expect(updatedPost).toHaveProperty('title', "Excellent Restaurant");
        });

        test('should update post rating', async () => {
            const newPost = await createPost(testPost);
            const updatedPost = await updatePostRating(newPost.userName, 4.7);
            expect(updatedPost).toBeDefined();
            expect(updatedPost).toHaveProperty('userName', newPost.userName);
            expect(updatedPost).toHaveProperty('rating', 4.7);
        });

        test('should update post content', async () => {
            const newPost = await createPost(testPost);
            const updatedPost = await updatePostContent(newPost.userName, "This is the best restaurant in the world");
            expect(updatedPost).toBeDefined();
            expect(updatedPost).toHaveProperty('userName', newPost.userName);
            expect(updatedPost).toHaveProperty('content', "This is the best restaurant in the world");
        });
    });

    describe("Delete Post (D)", () => {
        test('should delete an existing post', async () => {
            const newPost = await createPost(testPost);
            const deletedPost = await deletePost(newPost.userName);
            expect(deletedPost).toBeDefined();
            expect(deletedPost).toHaveProperty('userName', newPost.userName);
            expect(deletedPost).toHaveProperty('title', newPost.title);

            const deletedPostCheck = await getPostByTitle(newPost.title);
            expect(deletedPostCheck).toBeNull();
        });

        test("should return null if post is not found", async () => {
            const title = 'nonexistent';
            const deletedPost = await deletePost(title);
            expect(deletedPost).toBeNull();
        });
    });
});