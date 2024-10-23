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
const dotenv_1 = __importDefault(require("dotenv"));
const speakeasy_1 = __importDefault(require("speakeasy"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const generateSecretKey = () => {
    const secret = speakeasy_1.default.generateSecret({ length: 20 });
    return secret.base32; // Return the secret in base32 format
};
const verifyTOTP = (secret, token) => {
    return speakeasy_1.default.totp.verify({
        secret,
        encoding: 'base32', // Make sure the encoding matches your stored secret
        token,
        window: 1, // Allow a window for code verification
    });
};
const updateUserWith2FA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        // Generate the secret key for 2FA
        const secretKey = generateSecretKey();
        // Create the user with the secret key in the database
        const newUser = yield prisma.user.update({
            where: {
                user_id: id,
            },
            data: {
                twoFA: true,
                token: secretKey, // Store the secret key for 2FA
            },
        });
        // Return the secret key or QR code URL to the user for setup
        res.status(201).json({
            message: "User updated key successfully!",
            twoFactorSecret: secretKey, // Optionally, send back the secret key
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create user" });
    }
});
exports.updateUserWith2FA = updateUserWith2FA;
const generateQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        // Get the user from the database
        const user = yield prisma.user.findUnique({
            where: {
                user_id: id,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Generate the QR code URL for the user
        const qrCodeUrl = speakeasy_1.default.otpauthURL({
            secret: user.token || '', // Use the secret key stored in the database
            label: "PawderApp", // Label for the QR code
            issuer: "PawderApp", // Company name issuing the QR code
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
    const { OTP } = req.body; // Include OTP from the user
    try {
        const user = yield prisma.user.findUnique({
            where: {
                user_id: id,
            }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Verify the OTP code
        if (!user.token) {
            return res.status(400).json({ error: "2FA token is missing" });
        }
        const isTOTPValid = verifyTOTP(user.token, OTP);
        if (!isTOTPValid) {
            return res.status(401).json({ error: "Invalid 2FA code" });
        }
        res.status(200).json({
            message: "Verify successful!",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to verify OTP" });
    }
});
exports.verifyUserOTP = verifyUserOTP;
