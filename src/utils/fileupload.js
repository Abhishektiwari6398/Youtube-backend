import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config(); // Load the .env file

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Remove the locally saved temporary file
        fs.unlinkSync(localFilePath);

        return response;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);  // Log the error for debugging
        fs.unlinkSync(localFilePath);  // Remove the locally saved temporary file
        throw new Error("Failed to upload file to Cloudinary");  // Throw a descriptive error
    }
};

export { uploadOnCloudinary };