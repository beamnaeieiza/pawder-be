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
  getStatistic,
  getDogById,
  getUserIdInfo
} from "../controllers/userController";
import { uploadProfileImage, createPetWithImage } from "../controllers/imageController";
import { createComment } from "../controllers/ratingController";
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
router.get("/users/getDogById", authMiddleware, getDogById);
router.get("/users/getUserIdInfo/", authMiddleware, getUserIdInfo);

router.post("/users/createComment", authMiddleware, createComment);

router.post("/users/uploadProfileImage", upload.single('file'), authMiddleware, uploadProfileImage);
router.post("/users/createPetWithImage", upload.single('file'), authMiddleware, createPetWithImage);

router.get("/users/getStatistic", authMiddleware, getStatistic);

export default router;
