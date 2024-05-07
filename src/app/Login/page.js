"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDeviceData, osName } from "react-device-detect";
// import { object } from "request-ip/lib/is";
import signup from "../../../serverActions/user/signup";
import login from "../../../serverActions/user/login";
import Link from "next/link";
import sendEmail from "../../../serverActions/sendEmail";
import getIpDetails from "../../../serverActions/getIpDetails";

const page = () => {
  var router = useRouter();
  const [Processing, setProcessing] = useState(true);
  const [Token, setToken] = useState(null);

  useEffect(() => {
    (async () => {
      let token = await window.localStorage.getItem("userToken");

      if (token) return router.replace("/");

      setProcessing(false);
    })();
  }, []);

  useEffect(() => {
    if (!Processing) {
      const tm = setInterval(() => {
        let token = window.localStorage.getItem("userToken");

        if (token) {
          clearInterval(tm);
          return router.replace("/");
        }
      }, 500);
    }
  }, [Processing]);

  useEffect(() => {
    if (Processing) return;
    const signUpButton = document.getElementById("signUp");
    const signInButton = document.getElementById("signIn");
    const container = document.getElementById("container");

    signUpButton.addEventListener("click", () => {
      container.classList.add("right-panel-active");
    });

    signInButton.addEventListener("click", () => {
      container.classList.remove("right-panel-active");
    });
  }, [Processing]);
  const notify = (text) => toast(text);
  var signupSubmit = async (data) => {
    try {
      var { data: axres } = await axios.get("https://api.ipify.org/");
      axres = await getIpDetails({ ip: axres });
      var device = useDeviceData();
      delete device.UA;
      delete device.setUserAgent;
      var deviceDetails = {
        os: `${device.os.name} ${device.os.version}`,
        browser: `${device.browser.name} ${
          device.browser.major || device.browser.version
        }`,
        userAgent: device.ua,
        detailedInformation: device,
        ...axres,
      };
      var dat = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        deviceDetails,
      });
      if (dat.status) {
        toast.success(dat?.message || "Done");
        router.push("/");
      } else {
        toast.error(dat?.message || "Error");
      }
    } catch (error) {
      toast.error(error.response?.success || error.response?.error || "Error");
      // alert(JSON.stringify(error.response.data));
    }
  };
  var loginSubmit = async (data) => {
    try {
      var toastid = toast.loading("Sending Email");
      var check2FA = await sendEmail({ to: data.email });
      if (check2FA.success) {
        toast.update(toastid, {
          render: check2FA.msg,
          type: "success",
          autoClose: 5000,
          isLoading: false,
        });
        // toast.success();
      } else {
        return toast.update(toastid, {
          render: check2FA.msg,
          type: "error",
          autoClose: 5000,
          isLoading: false,
        });
        // return toast.error();
      }
      var otp = prompt("Enter OTP sent on your email address");
      var { data: axres } = await axios.get("https://api.ipify.org/");
      var toastid = toast.loading("Verifing details");
      axres = await getIpDetails({ ip: axres });
      var device = useDeviceData();
      delete device.UA;
      delete device.setUserAgent;
      var deviceDetails = {
        os: `${device.os.name} ${device.os.version}`,
        browser: `${device.browser.name} ${
          device.browser.major || device.browser.version
        }`,
        userAgent: device.ua,
        detailedInformation: device,
        ...axres,
      };
      var dat = await login({
        email: data.email,
        password: data.password,
        deviceDetails,
        otp,
      });
      if (dat.status) {
        toast.update(toastid, {
          render: dat?.message,
          type: "success",
          autoClose: 5000,
          isLoading: false,
        });
        // toast.success( || "Done");
        router.push("/");
        // localStorage.setItem("userToken", dat.data?.token);
      } else {
        toast.update(toastid, {
          render: dat?.message,
          type: "error",
          autoClose: 5000,
          isLoading: false,
        });
        // toast.error(dat?.message || "Error");
      }
    } catch (error) {
      toast.update(toastid, {
        render: error.response?.message || "Error",
        type: "error",
        autoClose: 5000,
        isLoading: false,
      });
      //   toast.error(error.response?.message || "Error");
      // alert(JSON.stringify(error.response.data));
    }
  };
  var getformInputs = (callback, el) => {
    var formOBJ = {};
    el.currentTarget
      .querySelectorAll("input")
      .forEach((el2) => (formOBJ[el2.name] = el2.value));
    return callback(formOBJ);
  };

  if (Processing) return <></>;

  return (
    <div className="w-[100vw] text-black h-[100vh] flex flex-col justify-center items-center">
      <h2
        className="mb-[1.5rem] hidden md:block text-xl md:text-4xl text-white"
        style={{ fontFamily: "Staatliches" }}
      >
        Secured Account Dashboard
      </h2>
      <div className="container " id="container">
        <div className="form-container sign-up-container ">
          <form
            className="login-signupform"
            onSubmit={(el) => {
              el.preventDefault();
              if (el.target.cnfPassword.value != el.target.password.value) {
                return alert("Please Double Check Your Given Password!");
              }
              getformInputs(signupSubmit, el);
            }}
          >
            <h1 className="text-3xl" style={{ fontFamily: "rubik" }}>
              Create Account
            </h1>
            <div className="social-container text-black flex text-[1rem]">
              <a href="#" className="social">
                <i className="fi fi-brands-facebook flex items-center"></i>
              </a>
              <a href="#" className="social">
                <i className="fi fi-brands-google flex items-center"></i>
              </a>
              <a href="#" className="social">
                <i className="fi fi-brands-linkedin flex items-center"></i>
              </a>
            </div>
            <span>Use your email for registration</span>
            <input
              className="login-signup-input"
              type="text"
              placeholder="Name"
              name="name"
            />
            <input
              className="login-signup-input"
              type="email"
              placeholder="Email"
              name="email"
            />
            <input
              className="login-signup-input"
              type="password"
              placeholder="Password"
              name="password"
            />
            <input
              className="login-signup-input"
              type="password"
              placeholder="Confirm Password"
              name="cnfPassword"
            />
            <button className="btnlogin-signup">Sign Up</button>
            <h3 className="text-black mt-[1rem] md:hidden block">
              Already have a account{" "}
              <button
                type="button"
                onClick={() => {
                  document
                    .querySelector("#container")
                    .classList.remove("right-panel-active");
                }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                login?
              </button>
            </h3>
          </form>
        </div>

        <div className="form-container sign-in-container ">
          <form
            className="login-signupform"
            onSubmit={(el) => {
              el.preventDefault();
              getformInputs(loginSubmit, el);
            }}
          >
            <h1 className="text-3xl" style={{ fontFamily: "rubik" }}>
              Sign in
            </h1>
            <div className="social-container flex text-[1rem]">
              <a href="#" className="social">
                <i className="fi fi-brands-facebook flex items-center"></i>
              </a>
              <a href="#" className="social">
                <i className="fi fi-brands-google flex items-center"></i>
              </a>
              <a href="#" className="social">
                <i className="fi fi-brands-linkedin flex items-center"></i>
              </a>
            </div>
            <span>Use your account</span>
            <input
              className="login-signup-input"
              type="email"
              placeholder="Email"
              name="email"
            />
            <input
              className="login-signup-input"
              type="password"
              placeholder="Password"
              name="password"
            />
            {/* <a href="#">Forgot your password?</a> */}
            <button className="btnlogin-signup">Sign In</button>
            <h3 className="text-black mt-[1rem] md:hidden block">
              Don't have a account{" "}
              <button
                type="button"
                onClick={() => {
                  document
                    .querySelector("#container")
                    .classList.add("right-panel-active");
                }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                signup?
              </button>
            </h3>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left flex flex-col gap-[1rem]">
              <h1 style={{ fontFamily: "rubik" }} className="text-4xl">
                Welcome Back!
              </h1>
              <p>
                To keep connected with us please login with your personal info
              </p>
              <button
                className="btnlogin-signup ghost !text-black !border-black"
                id="signIn"
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right flex flex-col gap-[1rem]">
              <h1 style={{ fontFamily: "rubik" }} className="text-4xl">
                Hello, Friend!
              </h1>
              <p>Enter your details and start journey with us</p>
              <button
                className="btnlogin-signup ghost !text-black !border-black"
                id="signUp"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
