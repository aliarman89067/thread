import mongoose from "mongoose";

let isConnected = false;
export const connectToDb = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) return console.log("Mongodb url not found!");
  if (isConnected) return console.log("Mongodb already connected");
  try {
    mongoose.connect(process.env.MONGODB_URL!);
    isConnected = true;
    console.log("Connected to Mongodb");
  } catch (error) {
    console.log(error);
  }
};
