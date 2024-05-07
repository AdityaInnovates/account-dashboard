"use client";

import { io } from "socket.io-client";
import Cookies from "js-cookie";
export const socket = io(
  "wss://mobilicis-india-private-limited-backen.onrender.com",
  {
    auth: { token: Cookies.get("token") },
  }
);
