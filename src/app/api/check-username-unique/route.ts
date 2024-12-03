import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextRequest } from "next/server";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export const GET = async (request: NextRequest) => {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    const result=UsernameQuerySchema.safeParse(queryParam);
   
   

    if(!result.success){
        const usernameErrors=result.error.format().username?._errors || []

        return Response.json({success:false, message:
          usernameErrors?.length > 0
            ? usernameErrors.join(', ')
            : 'Invalid query parameters',},{status:400})
    }
    const {username}=result.data;

    const existingVerifiedUser=await UserModel.findOne({username,isVerified:true});
    
    if(existingVerifiedUser){
        return Response.json({success:false,message:"Username already taken "},{status:400})
    }
    return Response.json({success:true,message:"Username is available "},{status:200})

  } catch (error) {
    console.error("Error validating user", error);
    return Response.json(
      {
        success: false,
        message: "Error validating username",
      },
      { status: 500 }
    );
  }
};
