import "./registerpage.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { FaGoogle, FaFacebook, FaGithub } from "react-icons/fa";
import apiRequest from "../../lib/apiRequest";
function RegisterPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    console.log(username, email, password);
    try {
      const res = await apiRequest.post("/auth/register", {
        username,
        email,
        password,
      });
      navigate("/login");
      console.log(res.data);
    } catch (error) {
      console.log(error);
      setError(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };
  const google = () => {
    window.location.href = "http://localhost:8800/api/auth/google";
  };
  const github = () =>{
    window.location.href = "http://localhost:8800/api/auth/github";
  }

  return (
    <div className="registerPage">
      <div className="formContainer">
        <form onSubmit={handleSubmit} className="wrapper">
          <h1>Crea un account</h1>
          <input name="username" type="text" placeholder="Username" />
          <input name="email" type="text" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          <button disabled={isLoading} className="registrati">Registrati</button>
          <div className="oauth">
            <button className="google" onClick={google}>
              <FaGoogle size={20} />
            </button>
            <button className="github" onClick={github}>
              <FaGithub size={20} />
            </button>
          </div>
          {error && <span>{error}</span>}
          <Link to="/login" className="loginLink">
            {" "}
            Hai già un account?
          </Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/homepng.jpg" alt="" />
      </div>
      <div className="riepmimento"></div>
    </div>
  );
}
export default RegisterPage;
