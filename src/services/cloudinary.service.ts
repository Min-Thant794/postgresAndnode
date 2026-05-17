import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

type UploadImgeOptions = {
    buffer: Buffer;
    folder: string;
};

export const uploadImageToCloudinary = ({
    buffer,
    folder,
}: UploadImgeOptions): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                if (!result) {
                    return reject(new Error("Cloudinary upload failed"));
                }

                resolve(result);
            }
        );

        stream.end(buffer);
    });
};

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
    await cloudinary.uploader.destroy(publicId);
};