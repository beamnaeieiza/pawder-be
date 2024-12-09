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
  getUserIdInfo,
  getUserLikeByList,
  deletePet,
  updateLocation,
  updateDistanceInterest,
  verifyId,
  blockUser,
  unblockUser,
  changeActivateAccount,
  getBlockedUsers,
  updateExpoToken

} from "../controllers/userController";
import {
  uploadProfileImage,
  createPetWithImages,
} from "../controllers/imageController";

import {
  updateUserWith2FA,
  generateQRCode,
  verifyUserOTP
} from "../controllers/2faController";
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
router.post(`${routeType}/createPet`, authMiddleware, createPet);
router.get(`${routeType}/getPet`, authMiddleware, getPetList);
router.delete("/users/:id", deleteUser);
router.get("/users/getDogById", authMiddleware, getDogById);
router.get("/users/getUserIdInfo/", authMiddleware, getUserIdInfo);

router.post("/users/createComment", authMiddleware, createComment);

router.post(
  "/users/uploadProfileImage",
  upload.single("file"),
  authMiddleware,
  uploadProfileImage
);
router.post(
  "/users/createPetWithImage",
  upload.array("files", 3), // Allow up to 10 files
  authMiddleware,
  createPetWithImages
);

router.get("/users/getStatistic", authMiddleware, getStatistic);
router.get("/users/getUserLikeByList", authMiddleware, getUserLikeByList);

router.post("/users/deletePet", authMiddleware, deletePet);
router.post("/users/updateLocation", authMiddleware, updateLocation);

router.post("/users/updateDistance", authMiddleware, updateDistanceInterest);

router.post("/users/verifyId", authMiddleware, verifyId);


router.post("/users/blockUser", authMiddleware, blockUser);
router.post("/users/unblockUser", authMiddleware, unblockUser);
router.post("/users/changeActivateAccount", authMiddleware, changeActivateAccount);
router.get("/users/getBlockedUsers", authMiddleware, getBlockedUsers);

router.post("/users/updateUserWith2FA", authMiddleware, updateUserWith2FA);
router.get("/users/generateQRCode", authMiddleware, generateQRCode);
router.post("/users/verifyUserOTP", authMiddleware, verifyUserOTP);

router.post("/users/updateExpoToken", authMiddleware, updateExpoToken);

export default router;
