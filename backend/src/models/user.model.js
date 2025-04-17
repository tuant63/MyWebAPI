import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: function() {
        // Chỉ bắt buộc khi không phải đăng nhập bằng Google
        return this.provider === 'local';
      }
    },
    password: {
      type: String,
      required: false, // Đổi thành false vì user Google không cần password
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    // Thêm các trường cần thiết cho Google OAuth
    googleId: {
      type: String,
      unique: true,
      sparse: true // Cho phép null/undefined và vẫn giữ unique
    },
    avatar: {
      type: String,
      default: ""
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    // Thêm thông tin bổ sung từ Google
    givenName: String,
    familyName: String,
    locale: String,
    // Có thể thêm các trường khác tùy nhu cầu
  },
  { timestamps: true }
);

// Thêm index cho email và googleId
userSchema.index({ email: 1, googleId: 1 });

const User = mongoose.model("User", userSchema);

export default User;