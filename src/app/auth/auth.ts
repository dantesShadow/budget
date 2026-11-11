import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb-client";
import { connectToDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Modèle Utilisateur pour Mongoose
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Connexion BDD
        await connectToDatabase();

        // 2. Recherche utilisateur
        const user = await User.findOne({ email: credentials.email as string });
        if (!user || !user.password) {
          return null;
        }

        // 3. Comparaison du mot de passe hashé
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name || "Utilisateur",
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
});