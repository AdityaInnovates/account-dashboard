"use server";
import { cookies } from "next/headers";
import dbConnect from "../../lib/database/dbconnect";
import usermodel from "../../lib/database/models/usermodel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import middleware from "../../lib/middleware";
import { nanoid } from "nanoid";
import secondstepmodel from "../../lib/database/models/secondstepmodel";
const nodemailer = require("nodemailer");
const login = async (body) => {
  try {
    var { email, password, deviceDetails, otp } = body;
    deviceDetails.date = Number(new Date());
    deviceDetails.id = nanoid(30);
    await dbConnect();
    var user = await usermodel.findOne({ email });
    if (!user) return { status: false, message: "Invalid email or password" };
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return { status: false, message: "Invalid email or password" };
    var otpmodel = await secondstepmodel.findOne({ email }).select("otp");
    if (otpmodel.otp != otp) {
      return { status: false, message: "incorrect otp" };
    }
    var mailsent = await sendMail({
      email,
      text: "New login detected from device details:",
      deviceDetails,
    });
    console.log(mailsent);
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

async function sendMail(newbody) {
  var { text, email, deviceDetails } = newbody;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ai.agent.innovates@gmail.com", // Your Gmail email address
      pass: process.env.emailpass, // Your Gmail password or App Password
    },
  });
  //   const data = deviceDetails;
  function generateTable() {
    var data = deviceDetails;
    delete data.id;
    data.date = new Date(deviceDetails.date).toLocaleString();
    let tableHTML = '<table style="border-collapse: collapse; width: 100%;">';
    for (const [key, value] of Object.entries(data)) {
      tableHTML += `
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${key}</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${
            typeof value === "object" ? JSON.stringify(value) : value
          }</td>
        </tr>
      `;
    }
    tableHTML += "</table>";
    return tableHTML;
  }
  // Email message options
  const mailOptions = {
    from: "Assignment By Aditya <ai.agent.innovates@gmail.com>", // Sender address
    to: email,
    subject: "2FA system",
    text: `${text}\n${JSON.stringify(deviceDetails)}`,
    html: ` <html>
     <body>
     <h3>New login detected from device:</h3>
     <div id="table-container">${generateTable()}</div>
  </body>

  </html>`,
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
