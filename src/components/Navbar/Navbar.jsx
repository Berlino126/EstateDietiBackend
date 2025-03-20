import { useState, useContext} from "react";
import "./navbar.scss";
import { Link } from "react-router";
import { AuthContext } from "../../context/AuthContext";
function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);


  return (
    <nav>
      <div className="left">
        <a href="/" className="logo">
          <img src="/logo.png" alt="" />
          <span>DietiEstate25</span>
        </a>
        <a href="/">HomePage</a>
        <a href="/">Compra</a>
        <a href="/">Affitta</a>
        <a href="/">Contatti</a>
      </div>
      <div className="right">
        {currentUser ? (
          <div className="user">
            <span>{currentUser.username}</span>
            <Link to ="/profile" className="profile">Profilo</Link>
          </div>
        ) : (
          <>
            <Link to="/login" className="aut">Accedi</Link>
            <Link to="/register" className="aut">Registrati</Link>
          </>
        )}

        <div className="menuIcon">
          <img
            src="/menu.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
        </div>
        <div className={open ? "menu active" : "menu"}>
          <Link to="/">HomePage</Link>
          <Link to="/chi-siamo">Chi siamo</Link>
          <Link to="/list">Compra</Link>
          <Link to="/list">Affitta</Link>
          {currentUser ? (
            <Link to="/profile">Profilo</Link>
          ) : (
            <>
              <Link to="/login">Accedi</Link>
              <Link to="/register">Registrati</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
