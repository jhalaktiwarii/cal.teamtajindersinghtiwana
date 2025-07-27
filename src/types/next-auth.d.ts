import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      phone: string
      name: string
      role: string
    }
  }

  interface User {
    phone: string
    name: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    phone: string
    name: string
    role: string
  }
}
