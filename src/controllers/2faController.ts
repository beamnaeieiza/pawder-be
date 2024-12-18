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
    return secret.base32; 
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
      encoding: 'base32',
      token,
      window: 1, 
    });
  };

  export const updateUserWith2FA = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
  
    try {

      const user = await prisma.user.findUnique({
        where: { user_id: id },
        select: { twoFA: true }
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

      const updatedUser = await prisma.user.update({
        where: {
            user_id: id,
        },
        data: {
          twoFA : !user.twoFA,

        },
      });
  

      res.status(201).json({
        message: `User ${updatedUser.twoFA ? 'enabled' : 'disabled'} 2FA successfully!`,

      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to toggle 2FA status" });
    }
  };


  export const generateQRCode = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
  
    try {
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

      res.status(200).json({ qrCodeUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  };


  export const verifyUserOTP = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { OTP } = req.body; 
  
    try {
        
     const user = await prisma.user.findUnique({
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

      const token = jwt.sign(
        { userId: id, username: user.username },
        JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
  
      res.status(200).json({
        message: "Verify successful!",
        token: token
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  };

