import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage,deleteConversation } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
import { blockUser, unblockUser,getBlockStatus} from "../controllers/message.controller.js";

router.post("/send/:id", protectRoute, sendMessage);
router.delete("/conversation/:userId", protectRoute, deleteConversation);
router.post("/block/:userId", protectRoute, blockUser);
router.delete("/block/:userId", protectRoute, unblockUser);
router.get("/block-status/:userId", protectRoute, getBlockStatus);
export default router;
