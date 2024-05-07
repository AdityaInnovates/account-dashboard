"use server";

import jwt from "jsonwebtoken";
import usermodel from "../../lib/database/models/usermodel";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import dbConnect from "../../lib/database/dbconnect";

const signup = async (body) => {
  await dbConnect();
  const { email, password, name, deviceDetails } = body;
  deviceDetails.date = Number(new Date());
  deviceDetails.id = nanoid(30);

  try {
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) return { status: false, message: "Email already exists" };
    const newUser = new usermodel({
      email,
      password,
      name,
      activities: deviceDetails,
    });
    await newUser.save();

    const token = jwt.sign({ _id: newUser._id }, process.env.SECRET_KEY);
    cookies().set("token", token);
    await usermodel.findOneAndUpdate(
      {
        _id: newUser._id,
        "activities.id": deviceDetails.id,
      },
      { "activities.$.token": token }
    );

    return {
      status: true,
      message: "User created successfully",
      token,
    };
  } catch (err) {
    console.error(err);
    return { status: false, message: "Server error" };
  }
};

export default signup;
