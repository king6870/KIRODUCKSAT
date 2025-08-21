import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Check if we have the required environment variables
const hasRequiredEnvVars = process.env.GOOGLE_CLIENT_ID && 
                          process.env.GOOGLE_CLIENT_SECRET && 
                          process.env.NEXTAUTH_SECRET

const handler = NextAuth({
  providers: hasRequiredEnvVars ? [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ] : [],
  callbacks: {
    async session({ session }) {
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
  pages: {
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-build",
})

export { handler as GET, handler as POST }