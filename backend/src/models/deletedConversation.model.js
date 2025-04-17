import mongoose from "mongoose";

const deletedConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  otherUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  deletedAt: {
    type: Date,
    default: Date.now
  }
});

const DeletedConversation = mongoose.model("DeletedConversation", deletedConversationSchema);
export default DeletedConversation;