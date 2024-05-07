"use server";
import { cookies } from "next/headers";
import usermodel from "../../lib/database/models/usermodel";
import jwt from "jsonwebtoken";
import middleware from "../../lib/middleware";
import { NextRequest, NextResponse } from "next/server";

const getAllDevices = async () => {
  // console.log(NextRequest);
  try {
    if (!cookies().has("token")) {
      return { status: false, redirect: true, url: "/Login" };
      return { status: false };
    }
    var userId = cookies().get("token").value;
    var decoded = jwt.verify(
      cookies().get("token").value,
      process.env.SECRET_KEY
    );
    var dbres = await usermodel.findById(decoded._id).select("activities");
    dbres.activities = dbres.activities
      .sort((a, b) => b.date - a.date)
      .map((el) => {
        if (el.token == cookies().get("token").value) {
          el.current = true;
        }
        return el;
      });
    return { status: true, data: dbres.activities };
  } catch (error) {
    console.log(error);
    return { status: false };
  }
};

export default async (...args) => middleware(getAllDevices, ...args);
