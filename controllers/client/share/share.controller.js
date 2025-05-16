const { prisma } = require("../../../configs/prisma");
const { createSuccessResponse } = require("../../../constants/responses");

const sharePost = async (req, res, next) => {
  const { userId } = req.user;
  const { post_id, group_ids = [] } = req.body;

  try {
    const postToShare = await prisma.post.findUnique({
      where: { id: post_id },
      include: { attachments: true },
    });

    if (!postToShare) {
      return res.status(404).json({ message: "Post to share not found" });
    }

    const originalOwnerId = postToShare.original_post_user_id || postToShare.user_id;

    const sharedPost = await prisma.post.create({
      data: {
        user_id: userId,
        original_post_user_id: originalOwnerId,
        content: postToShare.content,
        visibility: postToShare.visibility,
        attachments: {
          create: postToShare.attachments.map((att) => ({
            url: att.url,
            type: att.type,
            filename: att.filename,
            size: att.size,
            mimeType: att.mimeType,
          })),
        },
      },
    });

    if (group_ids.length > 0) {
      const groupPostData = group_ids.map((group_id) => ({
        group_id,
        post_id: sharedPost.id,
      }));
      await prisma.group_post.createMany({
        data: groupPostData,
        skipDuplicates: true,
      });

      const shareData = group_ids.map((group_id) => ({
        post_id: sharedPost.id,
        shared_by_id: userId,
        group_id,
        content: postToShare.content,
      }));
      
      await prisma.share.createMany({
        data: shareData,
        skipDuplicates: true,
      });
    }

    return res
      .status(200)
      .json(createSuccessResponse(sharedPost, "Post shared successfully."));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sharePost,
};
