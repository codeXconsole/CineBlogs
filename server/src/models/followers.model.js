import mongoose, { Schema } from "mongoose";

const followschema = new Schema(
  {
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    follower: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
  },
  { timestamps: true }
);

export const Follow = mongoose.model("Follow", followschema);
