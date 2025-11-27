import NextAuth, { DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
    interface Session {
        id_token?: string;
        user: {
            id?: string;
        } & DefaultSession["user"];
    }
}

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, token }: any) {
            // Pass the Google ID Token to the session so we can send it to the backend
            if (token?.id_token) {
                session.id_token = token.id_token as string;
            }
            return session;
        },
        async jwt({ token, account }: any) {
            // Persist the OAuth access_token and id_token to the token right after signin
            if (account) {
                token.id_token = account.id_token;
            }
            return token;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
