"use server";

import jwt from "jsonwebtoken";
import usermodel from "../../lib/database/models/usermodel";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import dbConnect from "../../lib/database/dbconnect";
import secondstepmodel from "../../lib/database/models/secondstepmodel";
const nodemailer = require("nodemailer");
const signup = async (body) => {
  await dbConnect();
  const { email, password, name, deviceDetails, otp } = body;
  var otpmodel = await secondstepmodel.findOne({ email }).select("otp");
  if (otpmodel.otp != otp) {
    return { status: false, message: "incorrect otp" };
  }
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
    await sendMail(email);
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

async function sendMail(email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ai.agent.innovates@gmail.com", // Your Gmail email address
      pass: process.env.emailpass, // Your Gmail password or App Password
    },
  });
  const mailOptions = {
    from: "Assignment By Aditya <ai.agent.innovates@gmail.com>", // Sender address
    to: email,
    subject: "2FA system",
    text: `Thanks for signing up to our website at https://account-dashboard-murex.vercel.app/ `,
    html: `<div><h3>Thanks for signing up to our <a href="https://account-dashboard-murex.vercel.app/">website.</a></h3></div>`,
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.log("Error sending email:", error);
    return false;
  }
}
