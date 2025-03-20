import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { data, useNavigate } from "react-router";
import axios from "axios";
import AdminDashboard from "../../components/AdminDashboard/admindashboard"; // Importa il componente AdminDashboard
import AgentDashboard from "../../components/AgentDashboard/agentdashboard"; // Importa il componente AgentDashboard
import "./profilepage.scss";
import EditAgencyDashboard from "../../components/EditAgencyDashboard/editAgencyDashboard";
import ImageWidget from "../../components/imageWidget/imageWidget";
import AvatarWidget from "../../components/imageWidget/AvatarWidget";
import ChangePassword from "../../components/ChangePassword/changePassword";
import { useInfiniteQuery } from "@tanstack/react-query";
import Build from "../../components/Build/Build";
import apiRequest from "../../lib/apiRequest";
function Profilepage() {
  const [agencyInfo, setAgencyInfo] = useState(null);
  const { updateUser, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("");
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [isEditAgencyOpen, setIsEditAgencyOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  useEffect(() => {
    // Recupera i dati dall'localStorage (se esistono)
    const user = JSON.parse(localStorage.getItem("user"));
    const agency = JSON.parse(localStorage.getItem("agency"));
    //console.log(agency);

    if (user && user.role === "agency" && agency) {
      setAgencyInfo(agency);
      setAvatar(agency.avatar || "");
    }
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout", {
        withCredentials: true,
      });
      updateUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("agency");
      localStorage.removeItem("token");
      document.cookie =
        "token_access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=35.181.57.245;";
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  const openPasswordChange = () => {
    setIsChangePasswordOpen(true);
  };

  const closePasswordChange = () => {
    setIsChangePasswordOpen(false);
  };
  const openAdminDialog = () => {
    setIsAdminOpen(true); // Apri la dialog degli admin
  };

  const closeAdminDialog = () => {
    setIsAdminOpen(false); // Chiudi la dialog degli admin
  };

  const openAgentDialog = () => {
    setIsAgentOpen(true); // Apri la dialog degli agenti
  };

  const closeAgentDialog = () => {
    setIsAgentOpen(false); // Chiudi la dialog degli agenti
  };
  const openEditAgencyDialog = () => {
    setIsEditAgencyOpen(true); // Apri la dialog degli agenti
  };

  const closeEditAgencyDialog = () => {
    setIsEditAgencyOpen(false); // Chiudi la dialog degli agenti
  };

  const updateAvatar = async (avatar) => {
    const confirm = window.confirm(
      "Sei sicuro di voler modificare l'immagine dell'agenzia?"
    );
    if (!confirm) return;

    try {
      const response = await apiRequest.put(
        "/user/updateAgencyProfile",
        {
          avatar: avatar,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setAvatar(avatar);
        const updatedAgency = { ...agencyInfo, avatar: avatar };
        setAgencyInfo(updatedAgency);
        localStorage.setItem("agency", JSON.stringify(updatedAgency));
      }
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'avatar:", error);
    }
  };

  const fetchSavedProperties = async ({ pageParam = 1 }) => {
    const res = await apiRequest.get(
      `/user/getSaved?page=${pageParam}`,
      { withCredentials: true }
    );

    console.log(res.data);
    return res.data;
  };

  const fetchUploadedProperties = async ({ pageParam = 1 }) => {
    const res = await apiRequest.get(
      `/user/getUploaded?page=${pageParam}`,
      { withCredentials: true }
    );
    console.log(res.data);
    return res.data;
  };
  const {
    data: savedProperties,
    fetchNextPage: fetchNextSavedPage,
    hasNextPage: hasNextSavedPage,
    isFetchingNextPage: isFetchingNextSavedPage,
  } = useInfiniteQuery({
    queryFn: ({ pageParam }) => fetchSavedProperties({ pageParam }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 10 ? pages.length + 1 : undefined;
    },
  });
  const {
    data: uploadedProperties,
    fetchNextPage: fetchNextUploadedPage,
    hasNextPage: hasNextUploadedPage,
    isFetchingNextPage: isFetchingNextUploadedPage,
  } = useInfiniteQuery({
    queryKey: ["uploadedProperties"], // 🔹 Aggiunto queryKey
    queryFn: ({ pageParam }) => fetchUploadedProperties({ pageParam }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 10 ? pages.length + 1 : undefined;
    },
  });
  if (savedProperties){
    return (
      <div className="profilePage">
        <div className="wrapper">
          <div className="title">
            <h1>Informazioni utente</h1>
          </div>
  
          <div className="info">
            <div className="agency">
              <div className="userinfo">
                <span>Nome utente: {currentUser.username}</span>
                <span>Email utente: {currentUser.email}</span>
              </div>
  
              {currentUser.role === "agency" && agencyInfo && (
                <div className="agencyinfo">
                  <span>
                    <img
                      src={avatar || ""}
                      onClick={() =>
                        document.getElementById("upload_widget").click()
                      }
                    />
                  </span>
                  <div className="agencyText">
                    <span>
                      {agencyInfo.name}, {agencyInfo.city}{" "}
                    </span>
                    <span>Email: {agencyInfo.email} </span>
                  </div>
                  <AvatarWidget
                    uwConfig={{
                      multiple: false,
                      cloudName: "dqmhaieiz",
                      uploadPreset: "DietiEstate25",
                      folder: "properties",
                    }}
                    setAvatar={(avatar) => {
                      setAvatar(avatar);
                      console.log("AAAA");
                      updateAvatar(avatar);
                    }}
                  />
                </div>
              )}
            </div>
  
            <button onClick={handleLogout}>Logout</button>
  
            {currentUser.role === "agency" && (
              <div className="upperbuttons">
                <button onClick={openAgentDialog}>Gestisci agenti</button>{" "}
                {/* Bottone per aprire la dialog degli agenti */}
                <button onClick={openPasswordChange}>Cambia Password </button>
              </div>
            )}
            {currentUser.role === "agent" && (
              <div className="upperbuttons">
                <button onClick={openPasswordChange}>Cambia Password </button>
              </div>
            )}
            {currentUser.role === "admin" && (
              <div className="upperbuttons">
                <button onClick={openPasswordChange}>Cambia Password </button>
                <button onClick={openEditAgencyDialog}>Gestisci Agenzie</button>
                <button onClick={openAdminDialog}>Gestisci amministratori</button>
              </div>
            )}
          </div>
  
          {(currentUser.role === "agent" || currentUser.role === "agency") && (
            <div className="title">
              <h1>Immobili caricati</h1>
              <button onClick={() => navigate("/edit-properties")}>
                Aggiungi nuova inserzione
              </button>
              {uploadedProperties?.pages
                .flatMap((page) => page.uploadedProperties || [])
                .map((item) =>
                  item ? <Build key={item.id} item={item} /> : null
                )}
            </div>
          )}
  
          <div className="title">
            <h1>Immobili Salvati</h1>
            {savedProperties?.pages
              .flatMap((page) => page.savedProperties || [])
              .map((item) => (item ? <Build key={item.id} item={item} /> : null))}
          </div>
        </div>
        {/* Componente AdminDashboard */}
        <AdminDashboard isOpen={isAdminOpen} onClose={closeAdminDialog} />
        {/* Componente AgentDashboard */}
        <AgentDashboard isOpen={isAgentOpen} onClose={closeAgentDialog} />{" "}
        {/* Aggiungi il componente AgentDashboard */}
        <EditAgencyDashboard
          isOpen={isEditAgencyOpen}
          onClose={closeEditAgencyDialog}
        />
        <ChangePassword
          isOpen={isChangePasswordOpen}
          onClose={closePasswordChange}
        />
      </div>
    );
  }

}

export default Profilepage;
