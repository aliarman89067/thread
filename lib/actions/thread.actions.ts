"use server";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDb } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDb();
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });
    //Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error creating thread ${error.message}`);
  }
}
export async function fetchPost(pageNumber = 1, pageSize = 20) {
  connectToDb();
  const skipLimit = (pageNumber - 1) * pageSize;
  const postQuery = Thread.find({
    parentId: { $in: [null || undefined] },
  })
    .sort({ createdAt: "desc" })
    .skip(skipLimit)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });
  const totalPostCount = await Thread.countDocuments({
    parentId: { $in: [null || undefined] },
  });
  const posts = await postQuery.exec();
  const isNext = totalPostCount > skipLimit + posts.length;
  return { posts, isNext };
}
export async function fetchThreadById(id: string) {
  try {
    //Populate community
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id  name parentId image",
      })
      .populate({
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "_id id name parentId image",
        },
      });
    return thread;
  } catch (error: any) {
    throw new Error(`Error Fetching thread ${error.message}`);
  }
}
export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  try {
    connectToDb();
    const originalThread = await Thread.findById(threadId);
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });
    const savedCommentThread = await commentThread.save();
    originalThread.children.push(savedCommentThread._id);
    await originalThread.save();
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error from commenting thread ${error.message}`);
  }
}
