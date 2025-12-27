import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError } from "../utils";
import { handleSuccess } from "../utils";

function Login() {
  const [loginInfo, setloginInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setloginInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlelogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("🤬 All fields are required...");
    }
    try {
      const url = "http://localhost:5000/api/v1/otp-login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      const { status, message } = data;
      if (status !== "success") {
        return handleError(`🤬 ${message}`);
      } else {
        handleSuccess("🥳 Please varify OTP to continue.");
        setTimeout(() => {
          navigate("/otpVarify");
        }, 5000);
      }
      console.log(data);
    } catch (err) {
      handleError("😱 Something went wrong. Please try again...");
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>

      <form onSubmit={handlelogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={loginInfo.email}
            onChange={handleChange}
            placeholder="Enter the email..."
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={loginInfo.password}
            onChange={handleChange}
            placeholder="Enter the password..."
          />
        </div>

        <button type="submit">login</button>
        <span>
          Don't have an account? <Link to="/signup">Signup</Link>
        </span>
        <span>
          Forgot Password? <Link to="/resetPass">Reset-Pass</Link>
        </span>
      </form>

      <ToastContainer />
    </div>
  );
}

export default Login;
