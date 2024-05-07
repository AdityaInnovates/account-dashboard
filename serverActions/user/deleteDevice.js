"use server";
import { cookies } from "next/headers";
import usermodel from "../../lib/database/models/usermodel";
import middleware from "../../lib/middleware";
import jwt from "jsonwebtoken";
const deleteDevice = async (body) => {
  var { deviceToken } = body;

  try {
    var { deviceToken } = body;
    var decoded = jwt.verify(
      cookies().get("token").value,
      process.env.SECRET_KEY
    );
    var dbres = await usermodel.findByIdAndUpdate(
      decoded._id,
      {
        $pull: { activities: { token: deviceToken } },
      },
      { new: true }
    );
    return { status: true };
  } catch (error) {
    console.log(error);
    return { status: false };
  }
};

export default async (body) => middleware(deleteDevice, body);
// export default deleteDevice;
