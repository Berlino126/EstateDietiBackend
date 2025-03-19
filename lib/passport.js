import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";

import jwt from "jsonwebtoken";
import prisma from "./prisma.js";
import bcrypt from "bcrypt";

//GITHUB
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8800/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile;
        const email = emails?.[0]?.value;
        const avatar = photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Email not found in Google profile"), null);
        }

        let user = await prisma.user.findUnique({
          where: { email },
          include: { oauthAccounts: true },
        });

        if (!user) {
          let username = displayName.replace(/\s+/g, "").toLowerCase();
          const existingUser = await prisma.user.findUnique({
            where: { username },
          });

          if (existingUser) {
            username += Math.floor(Math.random() * 10000); // Aggiunge un numero casuale se esiste già
          }
          const temporaryPassword = bcrypt.hashSync(username, 10);

          user = await prisma.user.create({
            data: {
              email,
              username,
              passwordHash: temporaryPassword,
              role: "user",
              avatar,
              oauthAccounts: {
                create: {
                  provider: "google",
                  providerId: id,
                },
              },
            },
          });
        }

        const token = jwt.sign(
          { id: user.id, role: user.role },
          "bTL8De4Sd6ky5U/fzAEXtVXd2P+NDwV+lQYZWkUxJsE=",
          { expiresIn: "1d" }
        );

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
//GITHUB
passport.use(
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8800/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile;
        const email = emails?.[0]?.value || `${id}@github.com`;

        const avatar = photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Email not found in Github profile"), null);
        }

        let user = await prisma.user.findUnique({
          where: { email },
          include: { oauthAccounts: true },
        });

        if (!user) {
          let username = (displayName || profile.username || `user${id}`).replace(/\s+/g, "").toLowerCase();

          const existingUser = await prisma.user.findUnique({
            where: { username },
          });

          if (existingUser) {
            username += Math.floor(Math.random() * 10000); // Aggiunge un numero casuale se esiste già
          }

          const temporaryPassword = bcrypt.hashSync(username, 10);

          user = await prisma.user.create({
            data: {
              email,
              username,
              passwordHash: temporaryPassword,
              role: "user",
              avatar,
              oauthAccounts: {
                create: {
                  provider: "github",
                  providerId: id,
                },
              },
            },
          });
        }

        const token = jwt.sign(
          { id: user.id, role: user.role },
          "bTL8De4Sd6ky5U/fzAEXtVXd2P+NDwV+lQYZWkUxJsE=",
          { expiresIn: "1d" }
        );
        
        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
