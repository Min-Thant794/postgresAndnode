import { Request, Response } from "express";
import { createUserService, deleteUserService, getUserByIdService, getUsersService, updateProfileService, updateEmailService, updatePasswordService } from "./user.service";
import { validateCreateUser, validateUpdateProfile, validateUpdateEmail, validateUpdatePassword } from "./user.validator";
import { UserParams } from "../../types/user.types";
import { asyncHandler } from "../../utils/asyncHandler";

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
    const users = await getUsersService();
    return res.status(200).json({
        message: "users fetched successfully",
        count: users.length,
        data: users,
    });
});

export const getUserById = asyncHandler<UserParams>(async (req, res) => {
    const user = await getUserByIdService(req.params.id);
    return res.status(200).json({
        message: "user fetched success",
        data: user,
    });
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const input = validateCreateUser(req.body);
    const user = await createUserService(input, req.file?.buffer);
    return res.status(201).json({
        message: "user created successfully",
        data: user,
    });
});

export const updateProfile = asyncHandler<UserParams>(async (req, res) => {
    const updates = validateUpdateProfile(req.body, {
        allowEmpty: Boolean(req.file),
    });
    const user = await updateProfileService(req.params.id, updates, req.file?.buffer);
    return res.status(200).json({
        message: "profile updated successfully",
        data: user,
    });
});;

export const updateEmail = asyncHandler<UserParams>(async (req, res) => {
    const { email, currentPassword } = validateUpdateEmail(req.body);
    const user = await updateEmailService(req.params.id, currentPassword, email);
    return res.status(200).json({
        message: "email updated successfully",
        data: user,
    });
});

export const updatePassword = asyncHandler<UserParams>(async (req, res) => {
    const { currentPassword, newPassword } = validateUpdatePassword(req.body);
    await updatePasswordService(req.params.id, currentPassword, newPassword);
    return res.status(200).json({
        message: "password updated successfully",
    });
});

export const deleteUser = asyncHandler<UserParams>(async (req, res) => {
    const result = await deleteUserService(req.params.id);
    return res.status(200).json({
        message: "user deleted success",
        data: result,
    })
});
