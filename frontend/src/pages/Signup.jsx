import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError } from "../utils";
import { handleSuccess } from "../utils";

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;
    if (!name || !email || !password) {
      return handleError("🤬 All fields are required...");
    }
    try {
      const url = "http://localhost:5000/api/v1/signup";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      const { status, message } = data;
      if (status !== "success") {
        return handleError(`🤬 ${message}`);
      } else {
        handleSuccess("🥳 Signup successful! Please login to continue.");
        setTimeout(() => {
          navigate("/login");
        }, 4000);
      }
      console.log(data);
    } catch (err) {
      handleError("😱 Something went wrong. Please try again...");
      handleError(`😱 ${err}`);
    }
  };

  return (
    <div className="container">
      <h1>Signup</h1>

      <form onSubmit={handleSignup}>
        <div>
          <label>User Name</label>
          <input
            type="text"
            name="name"
            value={signupInfo.name}
            onChange={handleChange}
            autoFocus
            placeholder="Enter the name..."
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={signupInfo.email}
            onChange={handleChange}
            placeholder="Enter the email..."
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={signupInfo.password}
            onChange={handleChange}
            placeholder="Enter the password..."
          />
        </div>

        <button type="submit">Signup</button>

        <span>
          Already have an account? <Link to="/login">Login</Link>
        </span>
      </form>

      <ToastContainer />
    </div>
  );
}

export default Signup;
