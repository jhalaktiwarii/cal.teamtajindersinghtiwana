import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { DefaultSession, Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { verifyUserCredentials } from "@/lib/services/users"

declare module "next-auth" {
  interface Session {
    user: {
      phone: string
      role: string
      id: string
      name: string
    } & DefaultSession["user"]
  }
}

interface User {
  phone: string
  role: string
  id: string
  name: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const user = await verifyUserCredentials(credentials.phone, credentials.password)
        if (!user) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.phone,
          phone: user.phone,
          role: user.role,
          name: user.phone 
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.phone = user.phone;
        token.role = user.role;
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session?.user) {
        session.user.phone = token.phone as string;
        session.user.role = token.role as string;
        session.user.id = token.id as string || token.sub || 'default'; // Ensure ID is never undefined
        session.user.name = token.name as string;
        
        // For debugging
        console.log('Session user:', session.user);
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
}
