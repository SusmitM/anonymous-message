import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions={
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text"},
                password: { label: "Password", type: "password" }
              },
              async authorize(credentials:any, req):Promise<any> {
                await dbConnect()
                try{
                    const user=await UserModel.findOne({
                        $or:[
                            {email:credentials.identifier},
                            {username:credentials.identifier}
                        ]
                    })
                    if(!user){
                        throw new Error("User not found with this email")
                    }
                    if (!user?.password) {
                        throw new Error("User password is not available");
                    }
                    if(!user.isVerified){
                        throw new Error("Please verify your account")
                    }
                   const isPasswordCorrect= await bcrypt.compare(credentials.password,user?.password);
                   if(isPasswordCorrect){
                    return user
                   }
                   else{
                    throw new Error("Incorrect Password")
                   }
                }
                catch(error:any){
                   throw new Error(error)
                }

              }
        }),
        
    ],
    callbacks:{
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const { email, name } = user;
                    await dbConnect();
        
                    const existingUser: any = await UserModel.findOne({ email });
        
                    if (!existingUser) {
                        if (!email) throw new Error("Email is required");
                        const username = email.split("@")[0];
                       
                        const newUser:any = await UserModel.create({
                            email,
                            username,
                            name,
                            isVerified: true,
                            isAcceptingMessages: true,
                        });
        
                        user._id = newUser._id.toString();
                        user.isVerified = newUser.isVerified;
                        user.username = newUser.username;
                        user.isAcceptingMessages = newUser.isAcceptingMessage;
                    } else {
                        user._id = existingUser._id.toString();
                        user.isVerified = existingUser.isVerified;
                        user.username = existingUser.username;
                        user.isAcceptingMessages = existingUser.isAcceptingMessages;
                    }
        
                    return true; // Allow sign-in
                } catch (error) {
                    console.error("Error during Google sign-in:", error);
                    return false; // Deny sign-in
                }
            }

            if (account?.provider === "credentials") {
                return true; // Credentials authentication handled in `authorize`
            }

            return false; // Deny sign-in for unsupported providers
        },
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.username = user.username;
                token.isAcceptingMessages = user.isAcceptingMessages;
            }
            return token as JWT & {
                _id?: string;
                isVerified?: boolean;
                username?: string;
                isAcceptingMessages?: boolean;
            };
        },

        async session({ session, token }: { session: any, token: JWT & { 
            _id?: string;
            isVerified?: boolean;
            username?: string;
            isAcceptingMessages?: boolean;
        }}) {
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.username = token.username;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
            }
            return session;
        },
         
    },
    pages: {
        signIn: '/auth/signin',
      
      },
      session:{
        strategy:"jwt"
      },
      secret:process.env.NEXTAUTH_SECRET
}