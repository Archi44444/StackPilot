import { deleteUserAccount, getUserProfile, syncUserProfile } from '../services/userService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const syncUser = asyncHandler(async (request, response) => {
  const body = request.validated.body;
  const profile = await syncUserProfile({
    uid: request.user.uid,
    email: request.user.email,
    displayName: body.displayName ?? request.user.name,
    photoURL: body.photoURL,
  });
  response.status(200).json({ data: profile });
});

export const getCurrentUser = asyncHandler(async (request, response) => {
  const profile = await getUserProfile(request.user.uid);
  response.status(200).json({ data: profile });
});
export const deleteAccount = asyncHandler(async (request, response) => {
  await deleteUserAccount(request.user.uid);
  response.status(204).send();
});
