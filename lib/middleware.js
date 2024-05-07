"use server";
import dbConnect from "./database/dbconnect";
import jwt from "jsonwebtoken";
import usermodel from "./database/models/usermodel";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, NextRequest } from "next/server";
export default async (...args) => {
  if (!cookies().has("token")) {
    return args[0](...args.slice(1));
  }
  await dbConnect();
  try {
    var decoded = jwt.verify(
      cookies().get("token").value,
      process.env.SECRET_KEY
    );
    var userId = decoded._id;
    var dbres = await usermodel.findById(userId).select("activities");
    if (
      !dbres.activities
        .map((el) => el.token)
        .includes(cookies().get("token").value)
    ) {
      cookies().delete("token");
      return { redirect: true, url: "/Login" };
      return NextResponse.redirect(new URL("/Login", NextRequest.url));
      //   redirect("/Login");
    } else {
      return args[0](...args.slice(1));
    }
  } catch (error) {
    console.log(error);
    // cookies().delete("token");
    // return NextResponse.redirect(new URL("/Login", request.url));
  }
  return args[0](...args.slice(1));
};
