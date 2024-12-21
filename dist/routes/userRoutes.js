"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const imageController_1 = require("../controllers/imageController");
const _2faController_1 = require("../controllers/2faController");
const ratingController_1 = require("../controllers/ratingController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const routeType = "/users";
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post(`${routeType}/signUp`, userController_1.signUp);
router.post(`${routeType}/login`, userController_1.login);
router.get("/users", userController_1.getUsers);
router.get("/users/getInfo", authMiddleware_1.default, userController_1.getUserById);
router.put("/users/update", authMiddleware_1.default, userController_1.updateUser);
router.post(`${routeType}/createPet`, authMiddleware_1.default, userController_1.createPet);
router.get(`${routeType}/getPet`, authMiddleware_1.default, userController_1.getPetList);
router.delete("/users/:id", userController_1.deleteUser);
router.get("/users/getDogById", authMiddleware_1.default, userController_1.getDogById);
router.get("/users/getUserIdInfo/", authMiddleware_1.default, userController_1.getUserIdInfo);
router.post("/users/createComment", authMiddleware_1.default, ratingController_1.createComment);
router.post("/users/uploadProfileImage", upload.single("file"), authMiddleware_1.default, imageController_1.uploadProfileImage);
router.post("/users/createPetWithImage", upload.array("files", 3), authMiddleware_1.default, imageController_1.createPetWithImages);
router.get("/users/getStatistic", authMiddleware_1.default, userController_1.getStatistic);
router.get("/users/getUserLikeByList", authMiddleware_1.default, userController_1.getUserLikeByList);
router.post("/users/deletePet", authMiddleware_1.default, userController_1.deletePet);
router.post("/users/updateLocation", authMiddleware_1.default, userController_1.updateLocation);
router.post("/users/updateDistance", authMiddleware_1.default, userController_1.updateDistanceInterest);
router.post("/users/verifyId", authMiddleware_1.default, userController_1.verifyId);
router.post("/users/blockUser", authMiddleware_1.default, userController_1.blockUser);
router.post("/users/unblockUser", authMiddleware_1.default, userController_1.unblockUser);
router.post("/users/changeActivateAccount", authMiddleware_1.default, userController_1.changeActivateAccount);
router.get("/users/getBlockedUsers", authMiddleware_1.default, userController_1.getBlockedUsers);
router.post("/users/updateUserWith2FA", authMiddleware_1.default, _2faController_1.updateUserWith2FA);
router.get("/users/generateQRCode", authMiddleware_1.default, _2faController_1.generateQRCode);
router.post("/users/verifyUserOTP", authMiddleware_1.default, _2faController_1.verifyUserOTP);
router.post("/users/updateExpoToken", authMiddleware_1.default, userController_1.updateExpoToken);
exports.default = router;
