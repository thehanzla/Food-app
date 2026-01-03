import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing from environment variables");
    return;
  }

  if (!cached.promise) {
    const opts = {
      // bufferCommands: false, // Removed to allow buffering
    };
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log("Mongodb successfully connected.");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("Error connecting to mongo db", e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;