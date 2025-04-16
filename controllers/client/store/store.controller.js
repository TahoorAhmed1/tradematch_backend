const { prisma } = require("../../../configs/prisma");
const {
  badRequestResponse,
  okResponse,
} = require("../../../constants/responses");
const {
  uploadImageFromBuffer,
  uploadVideoFromBuffer,
} = require("../../../middlewares/uploadPicture.middleware");

const createStory = async (req, res, next) => {
  try {
    const { userId, caption } = req.user;
    const file = req.files[0];

    if (!file)
      return res.status(400).json(badRequestResponse("No file provided."));

    let url;
    if (file.mimetype.startsWith("image/")) {
      url = await uploadImageFromBuffer(file);
    } else if (file.mimetype.startsWith("video/")) {
      console.log('file', file)
      url = await uploadVideoFromBuffer(file);
    } 

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

    // Group stories by user
    const storyGroups = stories.reduce((groups, story) => {
      const userId = story.user.id;
      const userName = story.user.profile
        ? `${story.user.profile.first_name || ""} ${
            story.user.profile.last_name || ""
          }`.trim()
        : "User";
      const userAvatar = story.user.profile?.profile_picture_url || "";

      if (!groups[userId]) {
        groups[userId] = {
          userId,
          userName,
          userAvatar,
          stories: [],
        };
      }

      groups[userId].stories.push(story);
      return groups;
    }, {});
console.log('Object.values(storyGroups)', Object.values(storyGroups))
    return res.status(200).json(okResponse(Object.values(storyGroups)));
  } catch (error) {
    next(error);
  }
};

module.exports = { createStory, getActiveStories };
