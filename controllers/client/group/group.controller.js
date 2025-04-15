const { prisma } = require("@/configs/prisma");
const {
  createSuccessResponse,
  updateSuccessResponse,
} = require("@/constants/responses");
const {
  deleteCloudinaryImage,
  uploadImageFromBuffer,
} = require("@/middlewares/uploadPicture.middleware");

const createGroup = async (req, res, next) => {
  const { userId } = req.user;
  const { name, description, category, location, is_private } = req.body;

  try {
    let cover_image_url;
    const coverPic = req.files?.find((f) => f.fieldname === "cover_image_url");
    if (coverPic) {
      cover_image_url = await uploadImageFromBuffer(coverPic);
    }

    const group = await prisma.group.create({
      data: {
        name,
        description,
        category,
        location,
        is_private,
        cover_image_url,
        creator_id: userId,
        members: {
          create: {
            user_id: userId,
            role: "ADMIN",
          },
        },
      },
    });

    const response = createSuccessResponse(
      group,
      "Group created successfully."
    );
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const updateGroup = async (req, res, next) => {
  const { groupId } = req.params;
  const { name, description, category, location, is_private } = req.body;

  try {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group)
      return res.status(404).json(badRequestResponse("Group not found."));

    let data = { name, description, category, location, is_private };

    const coverPic = req.files?.find((f) => f.fieldname === "cover_image_url");
    if (coverPic) {
      if (group.cover_image_url)
        await deleteCloudinaryImage(group.cover_image_url);
      data.cover_image_url = await uploadImageFromBuffer(coverPic);
    }

    const updated = await prisma.group.update({
      where: { id: groupId },
      data,
    });

    return res
      .status(200)
      .json(updateSuccessResponse(updated, "Group updated successfully."));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  updateGroup,
};
