import { Request, Response } from "express";
import * as postService from "../services/post.service";
import { Post } from "../models/Post";

export async function getAllPosts(req: Request, res: Response): Promise<void> {
  try {
    const posts = await postService.getAllPosts();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json("Error getting posts");
  }
}

export async function getPostById(req: Request, res: Response): Promise<void> {
  const postId = req.params.id;
  try {
    const post = await postService.getPostById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.status(200).json(post);
    }
  } catch (error) {
    res.status(500).json("Error getting post");
  }
}

export async function createPost(req: Request, res: Response): Promise<void> {
  const postData: Post = req.body;
  try {
    const newPost = await postService.createPost(postData);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json("Error creating post");
  }
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  const postId = req.params.id;
  const updatedPostData: Post = req.body;
  try {
    const updatedPost = await postService.updatePost(postId, updatedPostData);
    if (!updatedPost) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.status(200).json(updatedPost);
    }
  } catch (error) {
    res.status(500).json("Error updating post");
  }
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const postId = req.params.id;
  try {
    const result = await postService.deletePost(postId);
    if (!result) {
      res.status(404).json({ message: "Post not found" });
    } else {
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json("Error deleting post");
  }
}