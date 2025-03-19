import express from "express"
import { isRealEstateAdmin, isRealEstateAgency, isRealEstateAgent, verifyToken } from "../middleware/middleware.js";
import { addAdmin, addAgency, addAgent, changePassword, deleteAdmin, deleteAgency, deleteAgent, getAdmins, getAgencies, getAgents, getSavedProperties, getUploadedProperties, saveProperty, updateAgencyProfile } from "../controllers/user.js";
const router = express.Router();

router.post("/addAdmin", addAdmin)
router.post("/addAgency", addAgency)
router.post("/addAgent",isRealEstateAgency, addAgent)
router.get("/getAgents", isRealEstateAgency,getAgents)
router.get("/getAdmins", getAdmins)
router.get("/getAgencies", getAgencies)
router.delete("/deleteAdmin/:id",deleteAdmin)
router.delete("/deleteAgency/:id", deleteAgency)
router.delete("/deleteAgent/:id", deleteAgent)
router.put("/updateAgencyProfile",isRealEstateAgency, updateAgencyProfile);
router.put("/changePassword", verifyToken ,changePassword)
router.post("/save", verifyToken, saveProperty)
router.get("/getUploaded", isRealEstateAgent, getUploadedProperties)
router.get("/getSaved", verifyToken,getSavedProperties)

export default router