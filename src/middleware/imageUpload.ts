import multer from "multer";
import { AppError } from "../types/errors";

const storage = multer.memoryStorage();

export const uploadImage = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, //2MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new AppError(400, "Only JPG, and WEBP images are allowed"));
        }

        cb(null, true);
    },
});