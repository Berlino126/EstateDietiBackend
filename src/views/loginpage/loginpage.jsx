import "./loginpage.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FaGoogle, FaGithub } from "react-icons/fa";
import apiRequest from "../../lib/apiRequest";

function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");
  
    try {
      const res = await apiRequest.post("/auth/login", {
        username,
        password,
      }, { withCredentials: true });
  
      // Salva l'utente e l'agenzia (se esiste) nel localStorage
      const userData = res.data;
      localStorage.setItem("user", JSON.stringify(userData));
  
      // Se l'utente ha un'agenzia, salva anche le informazioni dell'agenzia
      if (userData.role === "agency" && userData.agencyInfo) {
        localStorage.setItem("agency", JSON.stringify(userData.agencyInfo));
      }
      console.log("Cookie ricevuto:", document.cookie);
      console.log(res);
      updateUser(userData);
      navigate("/"); // Reindirizza dopo il login
    } catch (err) {
      setError(err.response.data.message);
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

  useEffect(() => {
    // Recupera i dati dall'URL se presenti
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const user = {
      id: params.get("id"),
      username: params.get("username"),
      email: params.get("email"),
      role: params.get("role"),
    };

    if (token && user.id) {
      // Salva i dati nel localStorage
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      updateUser(user);
      navigate("/"); // Reindirizza alla home
    }
  }, [location, navigate, updateUser]);
  return (
    <div className="loginPage">
      <div className="formContainer">
        <form onSubmit={handleSubmit} className="wrapper">
          <h1>Accedi al tuo account</h1>
          <input name="username" type="text" placeholder="Username" />
          <input name="password" type="password" placeholder="Password" />
          <div className="error"></div>
          <button disabled={isLoading} className="accedi">
            Accedi
          </button>
          <div className="oauth">
            <button className="google" onClick={google}>
              <FaGoogle size={20} />
            </button>
            <button className="github" onClick={github}>
              <FaGithub size={20} />
            </button>
          </div>
          {error && <span>{error}</span>}
          <Link to="/register" className="loginLink">
            Non hai un account? Registrati
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

export default LoginPage;
