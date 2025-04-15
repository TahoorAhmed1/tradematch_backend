const { prisma } = require("@/configs/prisma");
const { badRequestResponse, okResponse } = require("@/constants/responses");
const {
  uploadImageFromBuffer,
} = require("@/middlewares/uploadPicture.middleware");

const createStory = async (req, res, next) => {
  try {
    const { userId, caption } = req.user;
    const file = req.files[0];
    console.log("file", req);
    if (!file)
      return res.status(400).json(badRequestResponse("No file provided."));

    const url = await uploadImageFromBuffer(file);
    const story = await prisma.story.create({
      data: {
        userId,
        mediaUrl: url,
        ...(caption && { caption: caption }),
        type: file.mimetype.includes("video") ? "VIDEO" : "IMAGE",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json(okResponse(story, "Story created."));
  } catch (error) {
    next(error);
  }
};
const getActiveStories = async (req, res, next) => {
  try {
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json(okResponse(stories));
  } catch (error) {
    next(error);
  }
};

module.exports = { createStory, getActiveStories };
