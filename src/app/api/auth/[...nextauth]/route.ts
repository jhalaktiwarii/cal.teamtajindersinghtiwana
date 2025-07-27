import NextAuth from "next-auth"
import { authOptions } from "./auth"
import { ensureAppointmentsTable } from "@/lib/schema/appointments"
import { DefaultSession } from "next-auth"

ensureAppointmentsTable().catch(console.error);

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



const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
