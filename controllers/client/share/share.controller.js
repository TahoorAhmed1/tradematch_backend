const { prisma } = require("@/configs/prisma");
const { createSuccessResponse } = require("@/constants/responses");

const sharePost = async (req, res, next) => {
  const { userId } = req.user;
  const { post_id, group_ids = [] } = req.body;

  try {
    const originalPost = await prisma.post.findUnique({
      where: { id: post_id },
      include: { attachments: true },
    });

    const attachmentsData = originalPost.attachments.map((file) => ({
      url: file.url,
      type: file.type,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimeType,
    }));

    const newPost = await prisma.post.create({
      data: {
        user_id: userId,
        content: originalPost.content,
        visibility: "GROUP_ONLY",
        attachments: {
          create: attachmentsData,
        },
      },
    });

    await prisma.group_post.createMany({
      data: group_ids.map((group_id) => ({
        group_id,
        post_id: newPost.id,
      })),
    });

    const share_data = await prisma.share.create({
      data: {
        post_id: newPost.id,
        shared_by_id: userId,
      },
    });

    return res
      .status(200)
      .json(createSuccessResponse(share_data, "Post shared successfully."));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sharePost,
};
