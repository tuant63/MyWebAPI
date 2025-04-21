import { X,Trash2,Ban } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState,useEffect } from "react";
import  toast  from "react-hot-toast";

import { axiosInstance } from "../lib/axios";
const ChatHeader = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const { selectedUser, setSelectedUser, deleteConversation, blockUser, unblockUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  // Thêm state cho block status
  const [blockStatus, setBlockStatus] = useState({
    isBlockedByMe: false,
    isBlockedByOther: false
  });
  // Kiểm tra trạng thái block khi component mount hoặc selectedUser thay đổi
  useEffect(() => {
    const checkBlockStatus = async () => {
      try {
        const res = await axiosInstance.get(`/messages/block-status/${selectedUser._id}`);
        setBlockStatus(res.data);
      } catch (error) {
        console.error("Error checking block status:", error);
      }
    };

    if (selectedUser) {
      checkBlockStatus();
    }
  }, [selectedUser]);


  const handleToggleBlock = async () => {
    try {
      if (blockStatus.isBlockedByMe) {
        await unblockUser(selectedUser._id);
        setBlockStatus(prev => ({...prev, isBlockedByMe: false}));
        toast.success("Đã bỏ chặn người dùng");
      } else {
        if (window.confirm("Bạn có chắc muốn chặn người dùng này?")) {
          await blockUser(selectedUser._id);
          setBlockStatus(prev => ({...prev, isBlockedByMe: true}));
          toast.success("Đã chặn người dùng");
        }
      }
    } catch (error) {
      toast.error("Không thể thực hiện thao tác này");
    }
  };

  
  const handleDeleteConversation = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa cuộc trò chuyện này không?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteConversation(selectedUser._id);
      toast.success("Đã xóa cuộc trò chuyện");
    } catch (error) {
      toast.error("Không thể xóa cuộc trò chuyện");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>
         
        

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
            {blockStatus.isBlockedByOther && (
                <span className="text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded">
                  Bạn đã bị chặn
                </span>
              )}
          </div>
        </div>
        <button
            onClick={handleToggleBlock}
            className={`btn btn-ghost btn-sm btn-circle ${
              blockStatus.isBlockedByMe ? "text-red-500" : "text-gray-500"
            }`}
            title={blockStatus.isBlockedByMe ? "Bỏ chặn người dùng" : "Chặn người dùng"}
          >
            <Ban size={18} />
          </button>
        <button
            onClick={handleDeleteConversation}
            disabled={isDeleting}
            className="btn btn-ghost btn-sm btn-circle text-red-500 hover:bg-red-500/10"
            title="Xóa cuộc trò chuyện"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
      
        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
