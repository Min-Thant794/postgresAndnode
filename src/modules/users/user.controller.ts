import { Request, Response } from "express";
import { createUserService, deleteUserService, getUserByIdService, getUsersService, updateUserService } from "./user.service";
import { validateCreateUser, validateUpdateUser, validateUserId } from "./user.validator";
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

export const updateUser = async (req: Request<UserParams>, res: Response) => {
    try {
        const { id } = req.params;
        validateUserId(id);
        const sanitizedUpdates = validateUpdateUser(req.body);
        const user = await updateUserService(id, sanitizedUpdates);
        return res.status(200).json({
            message: "user updated successfully",
            data: user,
        });
    } catch (error: any) {
        return handleControllerError(error, res);
    }
};

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
