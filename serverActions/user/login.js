"use server";
import { cookies } from "next/headers";
import dbConnect from "../../lib/database/dbconnect";
import usermodel from "../../lib/database/models/usermodel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import middleware from "../../lib/middleware";
import { nanoid } from "nanoid";
import fa_model from "../../lib/database/models/fa_model";
const login = async (body) => {
  try {
    var { email, password, deviceDetails, otp } = body;
    var otpmodel = await fa_model.findOne({ email }).select("otp");
    if (otpmodel.otp != otp) {
      return { status: false, message: "incorrect otp" };
    }
    deviceDetails.date = Number(new Date());
    deviceDetails.id = nanoid(30);
    await dbConnect();
    var user = await usermodel.findOne({ email });
    if (!user) return { status: false, message: "Invalid email or password" };
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return { status: false, message: "Invalid email or password" };
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    deviceDetails.token = token;
    await usermodel.findOneAndUpdate(
      {
        _id: user._id,
      },
      { $push: { activities: deviceDetails } }
    );

    cookies().set("token", token);
    return {
      status: true,
      message: "Login successful",
      token,
    };
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: "Login error",
    };
  }
};

export default async (...args) => middleware(login, ...args);
