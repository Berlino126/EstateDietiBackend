import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./admindashboard.scss";

import axios from "axios";
import apiRequest from "../../lib/apiRequest";

function AdminDashboard({ isOpen, onClose }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
  });

  const fetchAdmins = async () => {
    try {
      const response = await apiRequest.get(
        "/api/user/getAdmins",
        {
          withCredentials: true,
        }
      );
      setAdmins(response.data.admins.filter(admin => admin.id !== currentUser.id));
    } catch (error) {
      console.error("Errore nel recupero degli amministratori:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
    }
  }, [isOpen]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Sei sicuro di voler eliminare questo amministratore?');
    if (!confirmDelete) return;

    try {
      const res = await apiRequest.delete(`/user/deleteAdmin/${id}`, {
        withCredentials: true
      });
      alert('Amministratore eliminato con successo!');
      fetchAdmins();  // Ricarica gli admin dopo l'eliminazione
    } catch (error) {
      console.error('Errore nella richiesta API:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest.post(
        "/user/addAdmin", 
        newAdmin,
        { withCredentials: true }
      );
      alert('Nuovo amministratore aggiunto con successo!');
      setNewAdmin({ username: '', email: '', password: '' }); // Reset dei campi
      fetchAdmins();  // Ricarica la lista degli amministratori
    } catch (error) {
      console.error('Errore durante l\'aggiunta dell\'amministratore:', error);
      alert('Errore nell\'aggiunta dell\'amministratore');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-overlay">
      <div className="admin-dialog">
        <div className="header">
          <h1>Gestione Amministratori</h1>
          <button className="close-btn" onClick={onClose}>
            Chiudi
          </button>
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
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>


                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(admin.id)}
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-section">
          <h2>Desideri registrare un nuovo amministratore?</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              value={newAdmin.username}
              onChange={handleChange}
              placeholder="Nome nuovo amministratore"
              required
            />
            <input
              type="email"
              name="email"
              value={newAdmin.email}
              onChange={handleChange}
              placeholder="Email nuovo amministratore"
              required
            />
            <input
              type="password"
              name="password"
              value={newAdmin.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <button type="submit" className="submit-btn">
              Aggiungi amministratore
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
