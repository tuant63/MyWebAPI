import { useRef, useState,useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X,Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react"
import ImageModal from "./ImageModal"; // Import the ImageModal component
import { axiosInstance } from "../lib/axios";
const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage,selectedUser} = useChatStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
  const [showImageModal, setShowImageModal] = useState(false);
  const [blockStatus, setBlockStatus] = useState({
    isBlockedByMe: false,
    isBlockedByOther: false
  });
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const onEmojiClick = (emojiObject) => {
    setText(prevText => prevText + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {blockStatus.isBlockedByMe && (
        <div className="text-center py-2 bg-red-50 text-red-600 rounded mb-2">
          Bạn đã chặn người này. Bỏ chặn để tiếp tục trò chuyện.
        </div>
      )}
      
      {blockStatus.isBlockedByOther && (
        <div className="text-center py-2 bg-red-50 text-red-600 rounded mb-2">
          Bạn đã bị người này chặn.
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-zinc-700 cursor-pointer hover:opacity-90 transition-all" // Thêm các class này
            onClick={() => setShowImageModal(true)}
          />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
        
      {/* Message Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 relative">
          {/* Text Input */}
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder={
              blockStatus.isBlockedByMe 
                ? "Bỏ chặn để nhắn tin" 
                : blockStatus.isBlockedByOther 
                ? "Bạn đã bị chặn" 
                : "Nhập tin nhắn..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={blockStatus.isBlockedByMe || blockStatus.isBlockedByOther}
          />
          
  
          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
  
          {/* Action Buttons Container */}
          <div className="flex gap-2">
            {/* Emoji Button */}
            <div className="relative">
              <button
                type="button"
                className="hidden sm:flex btn btn-circle text-zinc-400 hover:text-primary hover:bg-primary/10"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={20} />
              </button>
  
              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <div className="shadow-xl rounded-lg">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      lazyLoadEmojis={true}
                      theme="dark"
                      width={300}
                      height={400}
                    />
                  </div>
                </div>
              )}
            </div>
  
            {/* Image Upload Button */}
            <button
              type="button"
              className={`hidden sm:flex btn btn-circle ${
                imagePreview ? "text-emerald-500" : "text-zinc-400 hover:text-primary hover:bg-primary/10"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} />
            </button>
          </div>
        </div>
  
        {/* Send Button */}
        <button
            type="submit"
            className="btn btn-circle btn-sm sm:btn-md bg-primary hover:bg-primary/90"
            disabled={
              (!text.trim() && !imagePreview) || 
              blockStatus.isBlockedByMe || 
              blockStatus.isBlockedByOther
            }
          >
            <Send size={20} className="text-white" />
          </button>
      </form>
    </div>
  );
};
export default MessageInput;
