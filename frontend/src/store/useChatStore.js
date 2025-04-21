import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
  deleteConversation: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/conversation/${userId}`);
      
      // Cập nhật state để ẩn tin nhắn đã xóa
      set((state) => ({
        messages: []
      }));
      
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  },
  blockUser: async (userId) => {
    try {
      await axiosInstance.post(`/messages/block/${userId}`);
      toast.success("Đã chặn người dùng");
    } catch (error) {
      toast.error(error.response?.data?.error || "Không thể chặn người dùng");
    }
  },

  unblockUser: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/block/${userId}`);
      toast.success("Đã bỏ chặn người dùng");
    } catch (error) {
      toast.error(error.response?.data?.error || "Không thể bỏ chặn người dùng");
    }
  },
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
