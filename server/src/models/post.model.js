import mongoose, { Schema } from "mongoose";

const postschema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
    },
    content: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    status: {
      type: Boolean,
      required: true,
    }
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postschema);
