import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./editAgencyDashboard.scss";
import axios from "axios";
import apiRequest from "../../lib/apiRequest";

function EditAgencyDashboard({ isOpen, onClose }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState([]);
  const [newAgency, setNewAgency] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    phone: "",
    website: "", // Nuovo campo per il sito web
    adminEmail: "",
    adminUsername: "",
    adminPassword: "",
  });

  const fetchAgencies = async () => {
    try {
      const response = await apiRequest.get("/user/getAgencies", {
        withCredentials: true,
      });
      setAgencies(response.data.agencies);
    } catch (error) {
      console.error("Errore nel recupero delle agenzie:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAgencies();
    }
  }, [isOpen]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Sei sicuro di voler eliminare questa agenzia? Elimineresti anche tutti gli immobili a lei associata!");
    if (!confirmDelete) return;

    try {
      await apiRequest.delete(`/user/deleteAgency/${id}`, {
        withCredentials: true,
      });
      alert("Agenzia eliminata con successo!");
      fetchAgencies();
    } catch (error) {
      console.error("Errore nella richiesta API:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAgency((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const agencyData = {
      name: newAgency.name,
      address: newAgency.address,
      city: newAgency.city,
      phone: newAgency.phone,
      email: newAgency.email,
      website: newAgency.website || "", // Aggiungi il sito web come opzionale
    };
  
    const gestorData = {
      email: newAgency.adminEmail,
      username: newAgency.adminUsername,
      password: newAgency.adminPassword,
      avatar: newAgency.adminAvatar || null, // Opzionale
    };
    console.log(agencyData);
    console.log(gestorData);
    try {
      const response = await apiRequest.post("/user/addAgency", { agencyData, gestorData });
  
      alert("Agenzia e gestore creati con successo!");
      
      fetchAgencies();
      console.log("Risultato:", response.data);
      // Puoi reindirizzare o aggiornare la lista delle agenzie
    } catch (error) {
      console.error("Errore nella richiesta:", error);
      alert(error.response?.data?.message || "Errore durante la creazione");
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="edit-agency-overlay">
      <div className="edit-agency-dialog">
        <div className="header">
          <h1>Gestione Agenzie Immobiliari</h1>
          <button className="close-btn" onClick={onClose}>Chiudi</button>
        </div>
        <div className="table-admin">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <tr key={agency.id}>
                  <td>{agency.id}</td>
                  <td>{agency.name}</td>
                  <td>{agency.email}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(agency.id)}>
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="createAgency">
          <h2>Desideri registrare una nuova agenzia immobiliare?</h2>
          <form className="form-section" onSubmit={handleSubmit}>
            <div className="agenziaForm">
              <h2>Dati agenzia immobiliare</h2>
              <input type="text" name="name" value={newAgency.name} onChange={handleChange} placeholder="Nome" required />
              <input type="email" name="email" value={newAgency.email} onChange={handleChange} placeholder="Email" required />
              <input type="text" name="address" value={newAgency.address} onChange={handleChange} placeholder="Indirizzo" />
              <input type="text" name="city" value={newAgency.city} onChange={handleChange} placeholder="Città" />
              <input type="text" name="phone" value={newAgency.phone} onChange={handleChange} placeholder="Telefono" />
              <input type="text" name="website" value={newAgency.website} onChange={handleChange} placeholder="Sito web (opzionale)" />
            </div>
            <div className="agenziaAdminForm">
              <h2>Ricorda di creare anche un'utenza di gestione per l'agenzia</h2>
              <input type="email" name="adminEmail" value={newAgency.adminEmail} onChange={handleChange} placeholder="Email Admin" required />
              <input type="text" name="adminUsername" value={newAgency.adminUsername} onChange={handleChange} placeholder="Username" required />
              <input type="password" name="adminPassword" value={newAgency.adminPassword} onChange={handleChange} placeholder="Password" required />
            </div>
            <button type="submit">Crea nuova agenzia</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditAgencyDashboard;
