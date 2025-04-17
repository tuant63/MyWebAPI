import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import { googleAuth } from '../controllers/auth.controller.js';
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      prompt: 'select_account'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await googleAuth(profile);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Lưu thông tin user vào session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Lấy thông tin user từ session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;