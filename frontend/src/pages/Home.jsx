import React from 'react'
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError } from "../utils";
import { handleSuccess } from "../utils";

function Home() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');

  const navigate = useNavigate();

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setName(user?.name);
    setEmail(user?.email);
  }, []);

  const handleLogout = async(e) => {
    try {
      const url = "http://localhost:5000/api/v1/logout";
      const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          });
          const data = await response.json();
          const { status, message } = data;
          if (status !== "success") {
            return handleError(`🤬 ${message}`);
          } else {
            handleSuccess("🥳 You have been logged out successfully.");
            setTimeout(() => {
              navigate("/login");
            }, 5000);
          }
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isVerified');
        } catch (err) {
          handleError("😱 Something went wrong. Please try again...");
        }
  };

  return (
    <div>
      <h1>Welcome {name}</h1>
      <button type='submit' onClick={handleLogout}>Logout</button>
      <ToastContainer />
    </div>
  )
}

export default Home