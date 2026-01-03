import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongodb successfully connected.");

  } catch (error) {
    console.log("error connecting to mongo db", error.message);

  }
}

export default connectDB