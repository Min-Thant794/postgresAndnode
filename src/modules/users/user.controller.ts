import { Request, Response } from "express";
import { createUserService, deleteUserService, getUserByIdService, getUsersService, updateProfileService, updateEmailService, updatePasswordService } from "./user.service";
import { validateCreateUser, validateUpdateProfile, validateUpdateEmail, validateUpdatePassword, validateUserId } from "./user.validator";
import { AppError } from "../../types/errors";
import { UserParams } from "../../types/user.types";

const handleControllerError = (error: any, res: Response) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ message: error.message });
    }

    if (error.code === "42601") {
        return res.status(500).json({ message: "sql syntax error" });
    }

    console.error("Controller error: ", error);
    return res.status(500).json({ message: "Internal server error" });
};

export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await getUsersService();
        return res.status(200).json({
            message: "users fetched successfully",
            count: users.length,
            data: users,
        });
    } catch (error: any) {
        return handleControllerError(error, res);
    }
};

export const getUserById = async (req: Request<UserParams>, res: Response) => {
    try {
        const { id } = req.params;
        validateUserId(id);
        const user = await getUserByIdService(id);
        return res.status(200).json({
            message: "user fetched successfully",
            data: user,
        });
    } catch (error: any) {
        return handleControllerError(error, res);
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const input = validateCreateUser(req.body);
        const user = await createUserService(input);
        return res.status(201).json({
            message: "user created successfully",
            data: user,
        });
    } catch (error: any) {
        return handleControllerError(error, res);
    }
};

export const updateProfile = async (req: Request<UserParams>, res: Response) => {
    try {
        const { id } = req.params;
        validateUserId(id);
        const { name, profile_url, birthday } = req.body;

        const sanitizedUpdates: Record<string, string | null> = {};

        if (name !== undefined) {
            sanitizedUpdates.name = String(name).trim();
        }

        if (profile_url !== undefined) {
            sanitizedUpdates.profile_url = profile_url;
        }

        if (birthday !== undefined) {
            sanitizedUpdates.birthday = birthday;
        }

        if (Object.keys(sanitizedUpdates).length === 0) {
            return res.status(400).json({
                message: "No valid fields provided for update"
            });
        }

        const user = await updateProfileService(id, sanitizedUpdates);

        return res.status(200).json({
            message: "profile updated successfully",
            data: user,
        });
    } catch (error: any) {
        return handleControllerError(error, res);
    }
};

export const updateEmail = async (req: Request<UserParams>, res: Response) => {
    try {
        const { id } = req.params;
        const { email, currentPassword } = req.body;

        if (!email || !currentPassword) {
            return res.status(400).json({
                message: "email and currentPassword are required"
            });
        };

        const user = await updateEmailService(id, currentPassword, email);

        return res.status(200).json({
            message: "email updated successfully",
            data: user,
        });
    } catch (error: any) {
        return handleControllerError(error, res);
    }
};

export const updatePassword = async (req: Request<UserParams>, res: Response) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "currentPassword and newPassword are requried"
            });
        };

        await updatePasswordService(id, currentPassword, newPassword);

        return res.status(200).json({
            message: "password updated successfully",
        });
    } catch (error: any) {
        return handleControllerError(error, res);
    }
}

export const deleteUser = async (req: Request<UserParams>, res: Response) => {
    try {
        const { id } = req.params;
        validateUserId(id);
        const result = await deleteUserService(id);
        return res.status(200).json({
            message: "user deleted successfully",
            data: result,
        });
    } catch (error: any) {
        return handleControllerError(error, res);
    }
};
