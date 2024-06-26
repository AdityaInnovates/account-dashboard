"use server";
import { cookies } from "next/headers";
// import secondstepmodel from "../lib/database/models/secondstepmodel";
// import secondstepmodel from "../lib/database/models/secondstepmodel";
import dbConnect from "../lib/database/dbconnect";
import mongoose from "mongoose";
import secondstepmodel from "../lib/database/models/secondstepmodel";

const nodemailer = require("nodemailer");
const sendEmail = async (body) => {
  await dbConnect();
  const { to } = body;
  var email = to;
  var fourdigitotp = Math.floor(1000 + Math.random() * 9000);
  var data = await secondstepmodel.findOne({ email });
  if (!data) {
    var tosave = new secondstepmodel({
      email,
      otp: fourdigitotp,
      totalTries: { tries: 1, date: new Date().toDateString() },
    });
    await tosave.save();
    var emailsent = await sendForgetPassMail({ to, otp: fourdigitotp, email });
    if (emailsent) {
      return {
        success: true,
        msg: "Email Sent",
      };
    } else {
      return {
        success: false,
        msg: "Unable To Send Email",
      };
    }
  }
  if (data?.totalTries?.tries && data.totalTries.tries > 5) {
    if (data.totalTries.date == new Date().toDateString()) {
      return {
        success: false,
        msg: "Max Tries Limit Reached. Try Tommorow",
      };
    } else {
      await secondstepmodel.findOneAndUpdate(
        { email },
        {
          "totalTries.tries": 1,
          "totalTries.date": new Date().toDateString(),
        }
      );

      var emailsent = await sendForgetPassMail({ to, email });
      if (emailsent) {
        return {
          success: true,
          msg: "Email Sent",
        };
      } else {
        return {
          success: false,
          msg: "Unable To Send Email",
        };
      }
    }
  } else {
    if (
      data?.totalTries?.date &&
      data.totalTries.date != new Date().toDateString()
    ) {
      await secondstepmodel.findOneAndUpdate(
        { email },
        {
          "totalTries.tries": 1,
          "totalTries.date": new Date().toDateString(),
        }
      );
    } else {
      await secondstepmodel.findOneAndUpdate(
        { email },
        {
          $inc: {
            "totalTries.tries": 1,
          },
          "totalTries.date": new Date().toDateString(),
        }
      );
    }
    var emailsent = await sendForgetPassMail({ to, email });
    if (emailsent) {
      return {
        success: true,
        msg: "Email Sent",
      };
    } else {
      return {
        success: false,
        msg: "Unable To Send Email",
      };
    }
  }
  // Create a transporter with Gmail SMTP credentials
};
async function sendForgetPassMail(newbody) {
  var { to, email } = newbody;
  console.log(newbody);
  var otp = newbody?.otp || Math.floor(1000 + Math.random() * 9000);
  await secondstepmodel.findOneAndUpdate({ email }, { otp });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ai.agent.innovates@gmail.com", // Your Gmail email address
      pass: process.env.emailpass, // Your Gmail password or App Password
    },
  });

  // Email message options
  const mailOptions = {
    from: "Assignment By Aditya <ai.agent.innovates@gmail.com>", // Sender address
    to,
    subject: "2FA system",
    text: `${otp}`,
    html: `<div>${otp}</div>`,
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

export default sendEmail;
