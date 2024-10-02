import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  signUp,
  login,
  createPet,
  getPetList,
} from "../controllers/userController";
import { uploadProfileImage } from "../controllers/imageController";
import authMiddleware from "../middlewares/authMiddleware";
import multer from "multer";

const router = Router();
const routeType = "/users";
const upload = multer({ storage: multer.memoryStorage() });

router.post(`${routeType}/signUp`, signUp);
router.post(`${routeType}/login`, login);
router.get("/users", getUsers);
router.get("/users/getInfo", authMiddleware, getUserById);
router.put("/users/update", authMiddleware, updateUser);
router.post(`${routeType}/createPet`,authMiddleware , createPet);
router.get(`${routeType}/getPet`,authMiddleware , getPetList);
router.delete("/users/:id", deleteUser);

router.post("/users/uploadProfileImage", upload.single('file'), authMiddleware, uploadProfileImage);

export default router;
