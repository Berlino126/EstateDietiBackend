import "./agencypage.scss"
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
function AgencyPage(){
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || currentUser.role !== "agency") {
            navigate("/");
        }
    }, [currentUser, navigate]); 

    return(
        <div className="agecypage">Agency Page</div>
    )
}
export default AgencyPage;