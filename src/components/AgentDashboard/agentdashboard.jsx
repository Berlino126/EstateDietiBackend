import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./agentdashboard.scss";
import apiRequest from "../../lib/apiRequest";

function AgentDashboard({ isOpen, onClose }) {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [newAgent, setNewAgent] = useState({
    username: "",
    email: "",
    password: "",
    avatar: "",  // Campo opzionale
  });

  // 🔹 **Recupero agenti**
  const fetchAgents = async () => {
    try {
      const response = await apiRequest.get("/user/getAgents", {
        withCredentials: true,
      });
      setAgents(response.data.agents);
    } catch (error) {
      console.error("Errore nel recupero degli agenti:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
    }
  }, [isOpen]);

  // 🔹 **Gestione input**
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAgent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 **Eliminazione agente**
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Sei sicuro di voler eliminare questo agente? Eliminerai anche tutti gli immobili a lui associato!");
    if (!confirmDelete) return;

    try {
      await apiRequest.delete(`/user/deleteAgent/${id}`, {
        withCredentials: true,
      });
      alert("Agente eliminato con successo!");
      fetchAgents();
    } catch (error) {
      console.error("Errore nella richiesta API:", error);
    }
  };

  // 🔹 **Aggiunta agente**
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await apiRequest.post("/user/addAgent", 
        { agentData: newAgent }, 
        {withCredentials:true}
      );

      alert("Agente aggiunto con successo!");
      console.log("Risultato:", response.data);

      // Reset form
      setNewAgent({ username: "", email: "", password: "", avatar: "" });

      // Aggiorna lista agenti
      fetchAgents();
    } catch (error) {
      console.error("Errore nella richiesta:", error);
      alert(error.response?.data?.message || "Errore durante la creazione");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="agent-overlay">
      <div className="agent-dialog">
        <div className="header">
          <h1>Gestione Agenti Immobiliari</h1>
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
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td>{agent.id}</td>
                  <td>{agent.username}</td>
                  <td>{agent.email}</td>

                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(agent.id)}>
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="form-section">
          <h2>Desideri registrare un nuovo agente immobiliare?</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="username" value={newAgent.username} onChange={handleChange} placeholder="Username" required />
            <input type="email" name="email" value={newAgent.email} onChange={handleChange} placeholder="Email" required />
            <input type="password" name="password" value={newAgent.password} onChange={handleChange} placeholder="Password" required />

            <button type="submit" className="submit-btn">Aggiungi Agente</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AgentDashboard;
