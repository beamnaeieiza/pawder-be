import { Router } from "express";
import {

  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  signUp,
  login,
} from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();
const routeType = "/users";

router.post(`${routeType}/signUp`, signUp);
router.post(`${routeType}/login`, login);
router.get("/users", getUsers);
router.get("/users/getInfo", authMiddleware, getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
