import mongoose from "mongoose";

mongoose.set("sanitizeFilter", true);

const uri = process.env.NEXT_MONGO_URI;

if (!uri) {
  throw new Error("NEXT_MONGO_URI is not defined in environment variables");
}

const connectMongo = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(uri);

    await Promise.all([
      import("@/models/user"),
      import("@/models/group"),
      import("@/models/workspace"),
      import("@/models/basicGroup"),
    ]);

    console.log("MongoDB connected and models registered.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("MongoDB connection error");
  }
};

export default connectMongo;
