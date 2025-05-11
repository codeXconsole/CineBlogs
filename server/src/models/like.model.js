import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  value: {
    type: Number,
    enum: [1, -1],
    required: true
  }
}, { timestamps: true });

export const Like = mongoose.model('Like', LikeSchema);
