import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import DeletedConversation from '../models/deletedConversation.model.js';
import BlockedUser from "../models/blockedUser.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";


export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Kiểm tra xem người dùng đã xóa cuộc trò chuyện chưa
    const deletedConversation = await DeletedConversation.findOne({
      userId: myId,
      otherUserId: userToChatId
    });

    let query = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId }
      ]
    };

    // Nếu người dùng đã xóa cuộc trò chuyện, chỉ lấy tin nhắn sau thời điểm xóa
    if (deletedConversation) {
      query.createdAt = { $gt: deletedConversation.deletedAt };
    }

    const messages = await Message.find(query).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
   

    const isBlocked = await BlockedUser.findOne({
      userId: senderId,
      blockedUserId: receiverId
    });
    if (isBlocked) {
      return res.status(403).json({ 
        error: "Bạn đã chặn người này. Hãy bỏ chặn để tiếp tục trò chuyện" 
      });
    }

    // Kiểm tra xem người gửi có bị chặn bởi người nhận không
    const isBlockedByReceiver = await BlockedUser.findOne({
      userId: receiverId,
      blockedUserId: senderId
    });

    if (isBlockedByReceiver) {
      return res.status(403).json({ 
        error: "Bạn đã bị người này chặn" 
      });
    }
    if (isBlockedByReceiver) {
      return res.status(403).json({ 
        error: "Bạn đã bị người này chặn" 
      });
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
   
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Lưu thông tin về cuộc trò chuyện đã xóa
    const deletedConversation = new DeletedConversation({
      userId: currentUserId,
      otherUserId: userId,
      deletedAt: new Date()
    });
    await deletedConversation.save();

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user._id;

    // Kiểm tra xem đã chặn chưa
    const existingBlock = await BlockedUser.findOne({
      userId: blockerId,
      blockedUserId: userId
    });

    if (existingBlock) {
      return res.status(400).json({ error: "Người dùng này đã bị chặn" });
    }

    const newBlock = new BlockedUser({
      userId: blockerId,
      blockedUserId: userId
    });

    await newBlock.save();
    res.status(200).json({ message: "Đã chặn người dùng thành công" });
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const blockerId = req.user._id;

    await BlockedUser.findOneAndDelete({
      userId: blockerId,
      blockedUserId: userId
    });

    res.status(200).json({ message: "Đã bỏ chặn người dùng" });
  } catch (error) {
    console.error("Error in unblockUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getBlockStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const isBlockedByMe = await BlockedUser.findOne({
      userId: currentUserId,
      blockedUserId: userId
    });

    const isBlockedByOther = await BlockedUser.findOne({
      userId: userId,
      blockedUserId: currentUserId
    });

    res.status(200).json({
      isBlockedByMe: !!isBlockedByMe,
      isBlockedByOther: !!isBlockedByOther
    });
    
  } catch (error) {
    console.error("Error in getBlockStatus:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};