"use client";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import deleteDevice from "../../serverActions/user/deleteDevice";
import { toast } from "react-toastify";
import getAllDevices from "../../serverActions/user/getAllDevices";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { socket } from "../socket";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    try {
      socket.emit("newSession", { token: Cookies.get("token") });
      if (Cookies.get("token") && !socket.connected) {
        socket.connect();
      }
      if (socket.connected) {
        onConnect();
      }

      function onConnect() {
        setIsConnected(true);
        setTransport(socket.io.engine.transport.name);

        socket.io.engine.on("upgrade", (transport) => {
          setTransport(transport.name);
        });
      }

      function onDisconnect() {
        setIsConnected(false);
        setTransport("N/A");
      }
      async function onLogout() {
        var apires = await deleteDevice({
          deviceToken: Cookies.get("token"),
        });
        if (apires?.redirect) {
          window.open(apires.url, "_self");
        }
        if (apires.status) {
          toast.success("Logged out");
        } else {
          toast.error("Error Occured");
        }
        socket.emit("newSession", {
          token: Cookies.get("token"),
        });
        socket.disconnect();
        Cookies.remove("token");
        router.push("/Login");
      }
      async function onNewSession() {
        var apires = await getAllDevices();

        if (apires?.redirect) {
          window.open(apires.url, "_self");
        }
        if (apires.status) {
          setdeviceDetails(apires.data);
        } else {
          toast.error("Logged Out");
        }
      }

      socket.on("connect", onConnect);
      socket.on("sessionAdded", onNewSession);
      socket.on("Logout", onLogout);
      socket.on("disconnect", onDisconnect);
      socket.on("connect_error", (err) => console.log(err));
      socket.on("connect_failed", (err) => console.log(err));
    } catch (error) {
      // console.log(error);
    }
  }, [Cookies.get("token")]);

  var router = useRouter();
  const [deviceDetails, setdeviceDetails] = useState([]);
  useEffect(() => {
    (async () => {
      var apires = await getAllDevices();

      if (apires?.redirect) {
        window.open(apires.url, "_self");
      }
      if (apires.status) {
        setdeviceDetails(apires.data);
      } else {
        toast.error("Logged Out");
      }
    })();
  }, []);
  return (
    <div>
      <div className="w-full h-full md:h-[100vh] md:bg-[#212121] flex items-center justify-center">
        <div className="bg-[#2c2c2c] border-[1px] border-[rgba(255,255,255,0.1)] rounded-md w-full md:w-[60rem] h-full md:h-[38rem] p-[1rem]">
          <div className="flex flex-col gap-[1rem]">
            <div className="flex justify-between items-start">
              <div className="flex gap-[0.5rem]">
                <img src="/images/secure.png" className="object-cover" alt="" />
                <div className="py-[0.8rem] flex flex-col gap-[0.5rem]">
                  <h3
                    className="text-sm md:text-xl font-semibold"
                    style={{ fontFamily: "varela round" }}
                  >
                    Manage Access and Device
                  </h3>
                  <h3 className="md:text-base text-[10px] w-full md:max-w-[50rem] text-slate-400">
                    These signed-in devices have recently been active on this
                    account. You can sign out any unfamiliar devices or change
                    your pass for added security.
                  </h3>
                </div>
              </div>
              <div className="group relative ">
                <i className="pt-[1rem] fi p-[0.5rem] cursor-pointer fi-br-menu-dots-vertical flex items-center"></i>
                <div className="group-hover:flex hidden">
                  <div className="bg-[#393939]  absolute right-0 rounded-md py-2">
                    <div className="flex gap-[0.5rem]">
                      <button
                        onClick={async () => {
                          var apires = await deleteDevice({
                            deviceToken: Cookies.get("token"),
                          });
                          if (apires?.redirect) {
                            window.open(apires.url, "_self");
                          }
                          if (apires.status) {
                            toast.success("Logged out");
                          } else {
                            toast.error("Error Occured");
                          }
                          socket.emit("newSession", {
                            token: Cookies.get("token"),
                          });
                          socket.disconnect();
                          Cookies.remove("token");
                          router.push("/Login");
                        }}
                        className="flex cursor-pointer px-4 py-2 gap-[0.5rem] items-center justify-center rounded-sm hover:bg-blue-600"
                      >
                        <i class="fi fi-br-power flex items-center"></i>
                        <h3>Logout</h3>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`/mt-[1rem] grid grid-cols-1 md:grid-cols-2 /items-center justify-center /flex /gap-x-[0rem] gap-y-[1.5rem] /mb-[1rem] /w-[55rem] ${
                deviceDetails[0] ? "h-full md:h-[26rem]" : ""
              }  md:overflow-y-scroll scrollbar-hide`}
            >
              {deviceDetails[0] &&
                deviceDetails.map((device) => (
                  <div className="flex w-full max-h-[12rem] /h-[10rem] items-center justify-center /border-[1px] /border-white /my-[1rem]">
                    <div className="bg-[#393939] w-[27rem]  h-full /h-[10rem] rounded-md border-[1px] border-[rgba(255,255,255,0.1)] p-[1rem]">
                      <div className="flex flex-col gap-[0.5rem]">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-[0.5rem] items-center">
                            <img
                              src={`/images/${
                                device.browser.toLowerCase().includes("chrome")
                                  ? "chrome"
                                  : device.browser
                                      .toLowerCase()
                                      .includes("firefox")
                                  ? "firefox"
                                  : device.browser
                                      .toLowerCase()
                                      .includes("edge")
                                  ? "edge"
                                  : device.browser
                                      .toLowerCase()
                                      .includes("safari")
                                  ? "safari"
                                  : "web"
                              }.svg`}
                              className="w-[2rem] object-cover"
                              alt=""
                            />
                            <h3
                              style={{ fontFamily: "rubik" }}
                              className="text-sm md:text-base"
                            >{`${device.browser} - ${device.os}`}</h3>
                          </div>
                          <div>
                            {device.current ? (
                              <h3 className="line-clamp-1 w-[5rem] md:w-full text-xs md:text-base px-[0.8rem] bg-blue-600 rounded-full text-white /font-semibold">
                                Current device
                              </h3>
                            ) : (
                              <button
                                onClick={async () => {
                                  var apires = await deleteDevice({
                                    deviceToken: device.token,
                                  });
                                  socket.emit("disconnect_user", {
                                    user: device.token,
                                  });
                                  if (apires?.redirect) {
                                    window.open(apires.url, "_self");
                                  }
                                  if (apires.status) {
                                    toast.success("Succesfully removed");
                                    var apires = await getAllDevices();
                                    if (apires?.redirect) {
                                      window.open(apires.url, "_self");
                                    }
                                    if (apires.status) {
                                      setdeviceDetails(apires.data);
                                    } else {
                                      toast.error("error");
                                    }
                                  } else {
                                    toast.error("Error Occured");
                                  }
                                }}
                                className="text-blue-500 hover:underline"
                              >
                                Sign Out
                              </button>
                            )}
                          </div>
                        </div>
                        <hr className="border-[1px] border-[rgba(255,255,255,0.1)] my-[0.2rem]" />
                        <div>
                          <div
                            className="flex flex-col gap-[0.5rem] p-[0.5rem] text-slate-400 text-sm md:text-base"
                            style={{ fontFamily: "poppins" }}
                          >
                            <div className="flex gap-[0.5rem] w-full ">
                              <i class="fi fi-rs-clock flex items-center /text-white"></i>
                              <h3>
                                {new Date(device.date).toDateString() +
                                  ", " +
                                  new Date(device.date)
                                    .toLocaleString()
                                    .split(" ")
                                    .slice(1)
                                    .join(" ")}
                              </h3>
                            </div>
                            <div className="flex gap-[0.5rem] w-full">
                              <i class="fi fi-rs-marker flex items-center /text-white"></i>
                              <h3>{device.location}</h3>
                            </div>
                            <div className="flex gap-[0.5rem] w-full line-clamp-1">
                              <i class="fi fi-br-link-alt flex items-center /text-white"></i>
                              <h3 className="line-clamp-1">{`${device.ipDetails} - ${device.provider}`}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {!deviceDetails[0] && (
              <div className="flex w-full h-[75vh] md:h-[10rem] items-center justify-center">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-[3rem] h-[3rem] text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span class="sr-only">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
