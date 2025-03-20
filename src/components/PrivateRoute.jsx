import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const PrivateRoute = ({ element, allowedRoles }) => {
  const { currentUser } = useContext(AuthContext);

  // Se non c'è un utente autenticato, rimanda alla pagina di login
  if (!currentUser){
    return <Navigate to="/login"/>;
  }
  // Se il ruolo dell'utente non è tra quelli consentiti, lo rimanda alla homepage
  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" />;
  }

  // Restituisce direttamente l'elemento se tutte le condizioni sono soddisfatte
  return element;
};

export default PrivateRoute;
