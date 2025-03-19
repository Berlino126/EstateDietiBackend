import express from "express"
import { addProperty, deleteProperty, getProperties, getProperty,updateProperty } from "../controllers/property.js";
import { isRealEstateAgent, verifyToken} from "../middleware/middleware.js";
const router = express.Router();

router.get("/", getProperties)
router.get("/:id",getProperty)
router.post("/", isRealEstateAgent, addProperty)
router.put("/:id", isRealEstateAgent, updateProperty)
router.delete("/:id", isRealEstateAgent, deleteProperty)

export default router