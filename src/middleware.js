import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, NextRequest } from "next/server";
// import verifyAuth from "./lib/jsonWebToken/verifytoken";
export async function middleware(request) {
  // if (mongoose.connection.readyState == 0) {
  //   // dbConnect();
  // }
  // if (!request.url.includes("/api/" && !request.method == "POST")) {
  // if (request.url.includes("static")) {
  // return NextResponse.next();
  // }
  // return NextResponse.next();
  // }
  // if (!cookies().has("token")) {
  // return NextResponse.redirect(new URL("/Login", request.url));
  // }
  var illigalStrings = [".ico", ".svg", ".png", ".jpg", ".js"];
  if (
    request.url.split("/").length == 4 &&
    !illigalStrings.find((el) => request.url.includes(el))
  ) {
    if (
      !cookies().has("token") &&
      request.url != "https://account-dashboard-murex.vercel.app/Login"
    ) {
      return NextResponse.redirect(new URL("/Login", request.url));
    } else if (
      cookies().has("token") &&
      request.url == "https://account-dashboard-murex.vercel.app/Login"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  // if (cookies().has("token")) {
  //   try {
  // var decoded = jwt.verify(
  //   cookies().get("token").value,
  //   process.env.SECRET_KEY
  // );
  // var dbres = await usermodel.findById(decoded._id).select("activities");
  // if (!dbres.activities.map((el) => el.token).includes(decoded._id)) {
  //   cookies().delete("token");
  //   redirect("/user");
  // }
  // } catch (error) {
  //   console.log(error);
  // cookies().delete("token");
  // redirect("/user");
  // }
  // }

  // console.log(request.nextUrl.pathname);

  NextResponse.next();

  // applyMiddleWare("/api/userAuth/getuserinfo", verifyAuth);

  // applyMiddleWare("")
  // if (request.nextUrl.pathname)
  // Response.json({ hello: "hi" });
  // return Response.json({ name: "Hello" });

  // async function applyMiddleWare(pathname, middleware) {
  //   if (request.nextUrl.pathname.startsWith(pathname)) {
  //     console.log("hello");
  //     // await middleware(
  //     //   { ...request, body: await request.json() },
  //     //   Response,
  //     //   Response.next
  //     // );
  //   }
  // }
}

export const config = {
  matcher: "/api/:path*",
  matcher: "/:path*",
};
