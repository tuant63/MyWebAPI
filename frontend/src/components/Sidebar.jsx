import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");
  const { onlineUsers,socket  } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  useEffect(() => {
    getUsers();
  }, [getUsers]);
  // Thêm effect để lắng nghe tin nhắn mới
  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", (message) => {
      // Kiểm tra nếu người dùng hiện tại không phải là người trong cuộc trò chuyện 
      if (message.senderId !== selectedUser?._id && message.receiverId !== selectedUser?._id) {
        setUnreadMessages((prev) => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
          [message.receiverId]: (prev[message.receiverId] || 0) + 1
        }));
      }
    });
  

    return () => {
      if (socket) {
        socket.off("newMessage");
      }
    };
  }, [selectedUser, socket]);
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setUnreadMessages((prev) => ({
      ...prev,
      [user._id]: 0
    }));
  };
  const filteredUsers = showOnlineOnly
    ? users.filter((user) => 
        onlineUsers.includes(user._id) && 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users.filter((user) => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        <div className="mt-3 hidden lg:block">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input input-sm input-bordered w-full"
          />
        </div>
        {/* TODO: Online filter toggle */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => handleSelectUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
              {unreadMessages[user._id] > 0 && (
                <span className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full 
                  flex items-center justify-center text-xs text-white font-medium">
                  {unreadMessages[user._id]}
                </span>
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
