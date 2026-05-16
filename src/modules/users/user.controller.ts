import { NextFunction, Request, Response } from "express";
import { createUserService, deleteUserService, getUserByIdService, getUsersService, updateProfileService, updateEmailService, updatePasswordService } from "./user.service";
import { validateCreateUser, validateUpdateProfile, validateUpdateEmail, validateUpdatePassword, validateUserId } from "./user.validator";
import { UserParams } from "../../types/user.types";

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await getUsersService();
        return res.status(200).json({
            message: "users fetched successfully",
            count: users.length,
            data: users,
        });
    } catch (error) {
        return next(error);
    }
};

export const getUserById = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        validateUserId(id);
        const user = await getUserByIdService(id);
        return res.status(200).json({
            message: "user fetched successfully",
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("REQ BODY: ", req.body);
        const input = validateCreateUser(req.body);
        console.log("VALIDATED INPUT: ", input);
        const user = await createUserService(input);
        return res.status(201).json({
            message: "user created successfully",
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

export const updateProfile = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        validateUserId(id);
        const updates = validateUpdateProfile(req.body);
        const user = await updateProfileService(id, updates);
        return res.status(200).json({
            message: "profile updated successfully",
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

export const updateEmail = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        validateUserId(id);
        const { email, currentPassword } = validateUpdateEmail(req.body);
        const user = await updateEmailService(id, currentPassword, email);
        return res.status(200).json({
            message: "email updated successfully",
            data: user,
        });
    } catch (error) {
        return next(error);
    }
};

export const updatePassword = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        validateUserId(id);
        const { currentPassword, newPassword } = validateUpdatePassword(req.body);
        await updatePasswordService(id, currentPassword, newPassword);
        return res.status(200).json({
            message: "password updated successfully",
        });
    } catch (error) {
        return next(error);
    }
};

export const deleteUser = async (req: Request<UserParams>, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        validateUserId(id);
        const result = await deleteUserService(id);
        return res.status(200).json({
            message: "user deleted successfully",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
};
