import "./layout.scss";
import Navbar from "../../components/Navbar/Navbar";
import { Outlet } from "react-router";
import { AuthContext } from "../../context/AuthContext";
import { useContext} from "react";
import { Navigate } from 'react-router';
function Layout() {
  return (
    <div className="layout">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet/>
      </div>
    </div>
  );
}
function AuthReq() {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    !currentUser ? (<Navigate to="/login"/>) :( <div className="layout">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
    )
  );
}

export { Layout, AuthReq };
