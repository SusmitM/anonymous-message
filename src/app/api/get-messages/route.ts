import dbConnect from "@/lib/dbConnect"
import { getServerSession, User } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/options"
import mongoose from "mongoose"
import UserModel from "@/model/User"

export const GET= async(request:Request)=>{
   await dbConnect()

   const session=await getServerSession(authOptions);
 
   const _user =session?.user as User;
  

   if(!session || !_user){
    return Response.json({success:false,message:"Not Authenticated"},{status:401})
   }
   console.log("🚀 ~ GET ~ session:", session);

   const userId=new mongoose.Types.ObjectId(_user._id); 
   console.log("🚀 ~ GET ~ userId:", userId)

   const user = await UserModel.findOne({_id: userId});
   console.log("🚀 ~ GET ~ user document:", user);

   if (!user) {
       return Response.json({
           success: false,
           message: 'User not found'
       }, { status: 401 });
   }

   console.log("🚀 ~ GET ~ user messages:", user.messages);

   if (user.messages.length === 0) {
       return Response.json({
           success: true,
           message: 'No messages found'
       }, { status: 200 });
   }

   const messages = await UserModel.aggregate([
       { $match: { _id: userId } },
       { $unwind: '$messages' },
       { $sort: { 'messages.createdAt': -1 } },
       { $group: { _id: '$_id', messages: { $push: '$messages' } } }
   ]);
   console.log("🚀 ~ GET ~ messages:", messages);

   try{
    const user=await UserModel.aggregate([
        {$match:{_id:userId}},
        {$unwind:'$messages'},
        {$sort:{'messages.createdAt':-1}},
        {$group:{_id:'$_id',messages:{$push:'$messages'}}}
    ])
    console.log("🚀 ~ GET ~ user:", user)
   
    if (!user || user.length === 0) {
        return Response.json({
            success:false,
            message:'User not found'
        },
    {status:401})
    }
    return Response.json({
        success:true,
        message:user[0]?.messages
    },
{status:200})
   }
   catch(error){
    console.error("Error to get message",error)
    return Response.json({
        success:false,
        message:'Internal Server Error'
    },
{status:500})
}

}