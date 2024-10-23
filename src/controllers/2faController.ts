import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import speakeasy from "speakeasy";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

const generateSecretKey = () => {
    const secret = speakeasy.generateSecret({ length: 20 });
    console.log("url = " + secret.otpauth_url);
    return secret.base32; // Return the secret in base32 format
  };

const verifyTOTP = (secret: string, token: string) => {

    const serverGeneratedToken = speakeasy.totp({
        secret,
        encoding: 'base32',
      });
    
      console.log(`Server Generated Token: ${serverGeneratedToken}`);
      console.log(`User Provided Token: ${token}`);

    return speakeasy.totp.verify({
      secret,
      encoding: 'base32', // Make sure the encoding matches your stored secret
      token,
      window: 1, // Allow a window for code verification
    });
  };

  export const updateUserWith2FA = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
  
    try {
      // Generate the secret key for 2FA
      const secretKey = generateSecretKey();
  
      // Create the user with the secret key in the database
      const newUser = await prisma.user.update({
        where: {
            user_id: id,
        },
        data: {
          twoFA : true,
        //   token: secretKey, // Store the secret key for 2FA
        },
      });
  
      // Return the secret key or QR code URL to the user for setup
      res.status(201).json({
        message: "User updated 2FA successfully!",
        twoFactorSecret: secretKey, // Optionally, send back the secret key
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create user" });
    }
  };


  export const generateQRCode = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
  
    try {
      // Get the user from the database
      const user = await prisma.user.findUnique({
        where: {
          user_id: id,
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const secret = speakeasy.generateSecret({ length: 20 });

      const qrCodeUrl = secret.otpauth_url;

      const updateUser = await prisma.user.update({
        where: {
            user_id: id,
        },
        data: {
          token: secret.base32, // Store the secret key for 2FA
        },
      });
      
      // Generate the QR code URL for the user
    //   const qrCodeUrl = speakeasy.otpauthURL({
    //     secret: user.token || '', // Use the secret key stored in the database
    //     label: "PawderApp", // Label for the QR code
    //     issuer: "PawderApp", // Company name issuing the QR code
    //   });

    //   console.log("token :" + updateUser.token)
  
      res.status(200).json({ qrCodeUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  };


  export const verifyUserOTP = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { OTP } = req.body; // Include OTP from the user
  
    try {
        
     const user = await prisma.user.findUnique({
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

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  };

