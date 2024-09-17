"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
const routeType = "/users";
router.post(`${routeType}/signUp`, userController_1.signUp);
router.post(`${routeType}/login`, userController_1.login);
router.get("/users", userController_1.getUsers);
router.get("/users/getInfo", authMiddleware_1.default, userController_1.getUserById);
router.put("/users/:id", userController_1.updateUser);
router.delete("/users/:id", userController_1.deleteUser);
exports.default = router;
