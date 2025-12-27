import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError, handleSuccess } from "../utils";

function OTP() {
  const [otpInfo, setotpInfo] = useState({
    email: "",
    otp: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setotpInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleotp = async (e) => {
    e.preventDefault();
    const { email, otp } = otpInfo;

    if (!email || !otp) {
      return handleError("🤬 All fields are required...");
    }

    try {
      const url = "http://localhost:5000/api/v1/verify-otp";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const res = await response.json();
      const { data, status, message, token } = res;

      if (status !== "success") {
        return handleError(`🤬 ${message}`);
      } else {
        // ✅ STORE LOGIN DATA IN LOCALSTORAGE
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isVerified", data?.isVerified);

        handleSuccess(
          `🥳 Congratulations ${data?.name} you have been logged in successfully.`
        );

        setTimeout(() => {
          navigate("/home");
        }, 5000);
      }

      console.log(res);
    } catch (err) {
      handleError("😱 Something went wrong. Please try again...");
    }
  };

  return (
    <div className="container">
      <h1>OTP Verification</h1>

      <form onSubmit={handleotp}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={otpInfo.email}
            onChange={handleChange}
            placeholder="Enter the email..."
          />
        </div>

        <div>
          <label>OTP</label>
          <input
            type="number"
            name="otp"
            value={otpInfo.otp}
            onChange={handleChange}
            placeholder="Enter the otp..."
          />
        </div>

        <button type="submit">OTP</button>
      </form>

      <ToastContainer />
    </div>
  );
}

export default OTP;
