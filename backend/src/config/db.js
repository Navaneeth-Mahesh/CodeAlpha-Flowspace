import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to your .env file (see .env.example).");
    process.exit(1);
  }

  mongoose.set("strictQuery", true);
  // Every document (and populated sub-document) serializes with a plain `id`
  // string alongside `_id`, so the frontend never has to special-case ObjectIds.
  mongoose.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.__v;
      return ret;
    },
  });
  mongoose.set("toObject", { virtuals: true });

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
