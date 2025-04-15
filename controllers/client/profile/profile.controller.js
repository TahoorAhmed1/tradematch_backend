const { prisma } = require("@/configs/prisma");
const redis = require("@/configs/redis");
const {
  badRequestResponse,
  createSuccessResponse,
  updateSuccessResponse,
} = require("@/constants/responses");
const {
  uploadImageFromBuffer,
  deleteCloudinaryImage,
} = require("@/middlewares/uploadPicture.middleware");

const createProfile = async (req, res, next) => {
  const { userId } = req.user;
  const { industry_subcategory_ids, ...data } = req.body;

  try {
    const existing = await prisma.profile.findUnique({
      where: { user_id: userId },
    });
    if (existing)
      return res
        .status(400)
        .json(badRequestResponse("Profile already exists."));

    const profilePic = req.files?.find(
      (f) => f.fieldname === "profile_picture"
    );
    const coverPic = req.files?.find((f) => f.fieldname === "cover_picture");

    if (profilePic)
      data.profile_picture_url = await uploadImageFromBuffer(profilePic);
    if (coverPic)
      data.cover_picture_url = await uploadImageFromBuffer(coverPic);

    const profile = await prisma.profile.create({
      data: {
        ...data,
        user_id: userId,
        industry_subcategories: industry_subcategory_ids?.length
          ? {
              set: [],
              connect: industry_subcategory_ids.map((id) => ({ id })),
            }
          : {},
      },
    });

    const response = createSuccessResponse(profile);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const { userId } = req.user;
  const { industry_subcategory_ids = [], ...data } = req.body;

  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res.status(404).json(badRequestResponse("Profile not found."));
    }

    const profilePic = req.files?.find(
      (f) => f.fieldname === "profile_picture_url"
    );
    if (profilePic) {
      if (profile.profile_picture_url) {
        await deleteCloudinaryImage(profile.profile_picture_url);
      }
      data.profile_picture_url = await uploadImageFromBuffer(profilePic);
    }

    const coverPic = req.files?.find(
      (f) => f.fieldname === "cover_picture_url"
    );
    if (coverPic) {
      if (profile.cover_picture_url) {
        await deleteCloudinaryImage(profile.cover_picture_url);
      }
      data.cover_picture_url = await uploadImageFromBuffer(coverPic);
    }

    const updated = await prisma.profile.update({
      where: { user_id: userId },
      data: {
        ...data,
        industry_subcategories: industry_subcategory_ids.length
          ? {
              set: [],
              connect: industry_subcategory_ids.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        user: true,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const cacheKey = `user:${userId}`;
    await redis.set(cacheKey, JSON.stringify(updatedUser), { EX: 300 });

    return res.status(200).json(updateSuccessResponse(updatedUser));
  } catch (error) {
    next(error);
  }
};

const getAllProfile = async (req, res, next) => {
  const userId = req.user.userId; // extract userId properly

  try {
    const profile = await prisma.profile.findMany({
      where: {
        user_id: {
          not: userId, // use `not` instead of `notIn` for a single ID
        },
      },
      include: {
        user: true,
      },
    });

    const response = createSuccessResponse(profile);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};


module.exports = { createProfile, updateProfile, getAllProfile };
