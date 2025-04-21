import mongoose from "mongoose";

const blockedUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  blockedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BlockedUser = mongoose.model("BlockedUser", blockedUserSchema);
export default BlockedUser;