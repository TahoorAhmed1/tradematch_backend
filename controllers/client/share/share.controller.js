const { prisma } = require("../../../configs/prisma");
const { createSuccessResponse } = require("../../../constants/responses");

const sharePost = async (req, res, next) => {
  const { userId } = req.user;
  const { post_id, group_ids = [] } = req.body;

  try {
    const originalPost = await prisma.post.findUnique({
      where: { id: post_id },
      include: { attachments: true, user: { include: { profile: true } } },
    });

    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }

    await prisma.share.createMany({
      data: group_ids?.map((group_id) => ({
        post_id,
        shared_by_id: userId,
        group_id,
      })),
    });

    return res
      .status(200)
      .json(createSuccessResponse(null, "Post shared successfully."));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sharePost,
};
