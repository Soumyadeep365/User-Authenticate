import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError } from "../utils";
import { handleSuccess } from "../utils";

function Reset() {
  const [resetInfo, setresetInfo] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setresetInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlereset = async (e) => {
    e.preventDefault();
    const { email, password } = resetInfo;
    if (!email || !password) {
      return handleError("🤬 All fields are required...");
    }
    try {
      const url = "http://localhost:5000/api/v1/reset-password";
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
        handleSuccess("🥳 Your password has been reset successfully...");
        setTimeout(() => {
          navigate("/login");
        }, 4000);
      }
      console.log(data);
    } catch (err) {
      handleError("😱 Something went wrong. Please try again...");
    }
  };

  return (
    <div className="container">
      <h1>Reset Password</h1>

      <form onSubmit={handlereset}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={resetInfo.email}
            onChange={handleChange}
            placeholder="Enter the email..."
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={resetInfo.password}
            onChange={handleChange}
            placeholder="Enter the password..."
          />
        </div>

        <button type="submit">reset</button>
        <span>
          Now Login yourself <Link to="/login">Login</Link>
        </span>
      </form>

      <ToastContainer />
    </div>
  );
}

export default Reset;
