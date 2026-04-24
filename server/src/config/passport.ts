import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User, IUser } from '../models/user.model';
import { env } from './env';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: env.GOOGLE_CLIENT_SECRET || 'dummy',
      callbackURL: `${env.CLIENT_URL}/api/v1/auth/google/callback`,
      passReqToCallback: true,
    },
    async (_req, _accessToken, _refreshToken, profile, done) => {
      try {
        const { id, emails, name, photos } = profile;
        const email = emails?.[0]?.value;

        // 1) Check if user already exists with this googleId
        let user = await User.findOne({ googleId: id });

        if (!user && email) {
          // 2) Check if user exists with this email (if so, link them)
          user = await User.findOne({ email });
          if (user) {
            user.googleId = id;
            if (!user.avatar && photos?.[0]?.value) {
              user.avatar = photos[0].value;
            }
            await user.save();
          } else {
            // 3) Create new user
            user = await User.create({
              googleId: id,
              email,
              name: {
                first: name?.givenName || 'Google',
                last: name?.familyName || 'User',
              },
              avatar: photos?.[0]?.value || '',
              isEmailVerified: true,
              // Password is required in schema, so generate a random one
              password: Math.random().toString(36).slice(-10) + 'A1!',
              phone: `google_${id}`, // Phone is also unique/required, using a placeholder
            });
          }
        }

        return done(null, user || false);
      } catch (err) {
        return done(err as Error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, (user as IUser).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err, false);
  }
});

export default passport;
