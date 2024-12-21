"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserOTP = exports.generateQRCode = exports.updateUserWith2FA = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const speakeasy_1 = __importDefault(require("speakeasy"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const generateSecretKey = () => {
    const secret = speakeasy_1.default.generateSecret({ length: 20 });
    console.log("url = " + secret.otpauth_url);
    return secret.base32;
};
const verifyTOTP = (secret, token) => {
    const serverGeneratedToken = speakeasy_1.default.totp({
        secret,
        encoding: 'base32',
    });
    console.log(`Server Generated Token: ${serverGeneratedToken}`);
    console.log(`User Provided Token: ${token}`);
    return speakeasy_1.default.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1,
    });
};
const updateUserWith2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const user = yield prisma.user.findUnique({
            where: { user_id: id },
            select: { twoFA: true }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const updatedUser = yield prisma.user.update({
            where: {
                user_id: id,
            },
            data: {
                twoFA: !user.twoFA,
            },
        });
        res.status(201).json({
            message: `User ${updatedUser.twoFA ? 'enabled' : 'disabled'} 2FA successfully!`,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to toggle 2FA status" });
    }
});
exports.updateUserWith2FA = updateUserWith2FA;
const generateQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const user = yield prisma.user.findUnique({
            where: {
                user_id: id,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const secret = speakeasy_1.default.generateSecret({ length: 20 });
        const qrCodeUrl = secret.otpauth_url;
        const updateUser = yield prisma.user.update({
            where: {
                user_id: id,
            },
            data: {
                token: secret.base32, // Store the secret key for 2FA
            },
        });
        res.status(200).json({ qrCodeUrl });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate QR code" });
    }
});
exports.generateQRCode = generateQRCode;
const verifyUserOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { OTP } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: {
                user_id: id,
            }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!user.token) {
            return res.status(400).json({ error: "2FA token is missing" });
        }
        const isTOTPValid = verifyTOTP(user.token, OTP);
        if (!isTOTPValid) {
            return res.status(401).json({ error: "Invalid 2FA code" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: id, username: user.username }, JWT_SECRET, {
            expiresIn: "24h",
        });
        res.status(200).json({
            message: "Verify successful!",
            token: token
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
});
exports.verifyUserOTP = verifyUserOTP;
