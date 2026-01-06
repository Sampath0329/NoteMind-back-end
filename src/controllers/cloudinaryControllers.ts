import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import cloudinary from "../config/cloudinaryConfig";
import { User } from "../models/userModle";

// Cloudinary Stream Helper Function
const uploadToCloudinary = (fileBuffer: Buffer, folderName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderName, resource_type: "auto" }, // "auto" is used to detect both PDF and Images
      (err, data) => {
        if (err) return reject(err);
        resolve(data);
      }
    );
    stream.end(fileBuffer);
  });
};

//  General Image Upload
export const imageUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File attachment is missing!" });

    const uploadResult = await uploadToCloudinary(req.file.buffer, "images");
    
    return res.status(200).json({ 
      imageUrl: uploadResult.secure_url 
    });
  } catch (error) {
    console.error("Image Upload Error:", error);
    return res.status(500).json({ message: "Failed to store image on Cloud." });
  }
};

//  Update Profile Picture
export const profileUpload = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user._id;
    if (!req.file) return res.status(400).json({ message: "Please select an image to upload." });

    const remoteFileData = await uploadToCloudinary(req.file.buffer, "profile-images");
    const secureLink = remoteFileData.secure_url;

    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      { imageUrl: secureLink },
      { new: true }
    );

    return res.status(200).json({ 
      success: true,
      user: updatedUser 
    });
  } catch (error) {
    return res.status(500).json({ message: "Profile image synchronization failed." });
  }
};

//  PDF Document Upload
export const pdfUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF file detected in the request." });

    const cloudFile = await uploadToCloudinary(req.file.buffer, "pdf");

    return res.status(200).json({ 
      pdfUrl: cloudFile.secure_url 
    });
  } catch (error) {
    console.error("PDF Upload Error:", error);
    return res.status(500).json({ message: "Document upload process encountered an error." });
  }
};