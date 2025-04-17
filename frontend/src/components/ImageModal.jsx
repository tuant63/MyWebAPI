import { X } from "lucide-react";

const ImageModal = ({ imageSrc, onClose }) => {
  if (!imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageSrc}
          alt="Full preview"
          className="rounded-lg max-w-full max-h-full"
        />
        <button
          className="absolute top-4 right-4 bg-white rounded-full p-1 shadow"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default ImageModal;
