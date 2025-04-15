const { prisma } = require("@/configs/prisma");
const {
  createSuccessResponse,
  updateSuccessResponse,
  deleteSuccessResponse,
  badRequestResponse,
  notFoundResponse,
} = require("@/constants/responses");

const createComment = async (req, res, next) => {
  const { userId } = req.user;
  const { post_id, content, parent_id } = req.body;

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        post_id,
        user_id: userId,
        parent_id: parent_id || null,
      },
      include: {
        user: true,
      },
    });

    const response = createSuccessResponse(comment, "Comment posted.");
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  const { userId } = req.user;
  const { comment_id } = req.params;
  const { content } = req.body;

  try {
    const comment = await prisma.comment.findUnique({ where: { id: comment_id } });

    if (!comment || comment.is_deleted) {
      return res.status(404).json(notFoundResponse("Comment not found."));
    }

    if (comment.user_id !== userId) {
      return res.status(403).json(badRequestResponse("You can only edit your own comment."));
    }

    const updated = await prisma.comment.update({
      where: { id: comment_id },
      data: {
        content,
      },
    });

    const response = updateSuccessResponse(updated, "Comment updated.");
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  const { userId } = req.user;
  const { comment_id } = req.params;

  try {
    const comment = await prisma.comment.findUnique({ where: { id: comment_id } });

    if (!comment || comment.is_deleted) {
      return res.status(404).json(notFoundResponse("Comment not found."));
    }

    if (comment.user_id !== userId) {
      return res.status(403).json(badRequestResponse("You can only delete your own comment."));
    }

    await prisma.comment.update({
      where: { id: comment_id },
      data: {
        is_deleted: true,
      },
    });

    const response = deleteSuccessResponse({}, "Comment deleted.");
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
};
