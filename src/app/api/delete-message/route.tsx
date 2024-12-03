import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";

export const DELETE = async (request: NextRequest) => {
  await dbConnect();
  const session = await getServerSession(authOptions);
 
  const _user = session?.user as User;

  if (!session || !_user) {
    return Response.json({ message: "Not Authenticated" }, { status: 401 });
  }
  try {
    const { messageId } = await request.json();

    const deleteResponse = await UserModel.updateOne(
      { _id: _user?._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (deleteResponse.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Unable to delete message or message already deleted",
        },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Message deleted succesfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error: Unable to delete message", error);
    return Response.json(
      { message: "Unable to delete message" },
      { status: 500 }
    );
  }
};
