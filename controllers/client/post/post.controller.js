const { pusher } = require("../../../configs/pusher");
const { prisma } = require("../../../configs/prisma");
const {
  createSuccessResponse,
  okResponse,
  updateSuccessResponse,
  deleteSuccessResponse,
  badRequestResponse,
} = require("../../../constants/responses");
const {
  uploadImageFromBuffer,
  deleteCloudinaryImage,
  uploadVideoFromBuffer,
} = require("../../../middlewares/uploadPicture.middleware");

const createPost = async (req, res, next) => {
  const { userId } = req.user;
  const { content, group_id } = req.body;

  try {
    let attachment = null;
    const file = req?.files?.[0];

    if (file) {
      let url;

      if (file.mimetype.startsWith("image/")) {
        url = await uploadImageFromBuffer(file);
      } else if (file.mimetype.startsWith("video/")) {
        url = await uploadVideoFromBuffer(file);
      } else {
        return res.status(400).json(badRequestResponse("Unsupported file type."));
      }

      attachment = await prisma.file.create({
        data: {
          url,
          type: file.mimetype.includes("video") ? "VIDEO" : "IMAGE",
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      });
    }

    const newPost = await prisma.post.create({
      data: {
        user_id: userId,
        content,
        visibility: group_id ? "GROUP_ONLY" : "PUBLIC",
        attachments: attachment
          ? {
            connect: { id: attachment.id },
          }
          : undefined,
        group_posts: group_id
          ? {
            create: {
              group_id,
            },
          }
          : undefined,
      },
      include: {
        attachments: true,
        group_posts: true,
      },
    });

    const response = createSuccessResponse(
      newPost,
      "Post created successfully."
    );
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  const { userId } = req.user;
  const { post_id } = req.params;
  const { content } = req.body;

  try {
    const post = await prisma.post.findUnique({
      where: { id: post_id },
    });

    if (!post || post.user_id !== userId) {
      return res
        .status(403)
        .json(badRequestResponse("Unauthorized or post not found."));
    }

    const updatedPost = await prisma.post.update({
      where: { id: post_id },
      data: {
        content,
      },
      include: {
        attachments: true,
      },
    });

    const response = updateSuccessResponse(updatedPost, "Post updated.");
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  const { userId } = req.user;
  const { post_id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: post_id },
      include: {
        attachments: true,
      },
    });

    if (!post || post.user_id !== userId) {
      return res
        .status(403)
        .json(badRequestResponse("Unauthorized or post not found."));
    }

    await Promise.all(
      post.attachments.map(async (file) => {
        await deleteCloudinaryImage(file.url);
        await prisma.file.delete({ where: { id: file.id } });
      })
    );

    await prisma.post.delete({
      where: { id: post_id },
    });

    const response = deleteSuccessResponse("Post deleted successfully.");
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const getAllVisiblePublicPost = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        visibility: "PUBLIC",
        is_deleted: false,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        attachments: true,
        user: {
          include: {
            profile: true,
          },
        },
        likes: true,
        comments: {
          where: { is_deleted: false },
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
        shares: {
          select: {
            id: true
          }
        }
      },
    });


    const buildNestedComments = (flatComments) => {
      const commentMap = new Map();
      const roots = [];

      flatComments.forEach((comment) => {
        comment.replies = [];
        commentMap.set(comment.id, comment);
      });

      flatComments.forEach((comment) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) parent.replies.push(comment);
        } else {
          roots.push(comment);
        }
      });

      return roots;
    };

    const formattedPosts = posts.map((post) => ({
      ...post,
      comments: buildNestedComments(post.comments),
    }));

    const response = okResponse(formattedPosts);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const likePost = async (req, res, next) => {
  const { userId } = req.user;
  const { post_id } = req.body;

  try {
    const post = await prisma.post.findUnique({
      where: { id: post_id },
      select: { id: true, user_id: true, is_deleted: true },
    });

    if (!post || post.is_deleted) {
      return res.status(404).json(badRequestResponse("Post not found."));
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        user_id_post_id: { user_id: userId, post_id },
      },
    });

    let responseData;

    await prisma.$transaction(async (prisma) => {
      if (existingLike) {
        const deletedLike = await prisma.like.delete({
          where: { user_id_post_id: { user_id: userId, post_id } },
        });
        responseData = {
          data: deletedLike,
          message: "Post unliked successfully.",
        };
      } else {
        const newLike = await prisma.like.create({
          data: { user_id: userId, post_id },
        });

        responseData = {
          data: newLike,
          message: "Post liked successfully.",
        };

        if (userId !== post.user_id) {
          const profile = await prisma.profile.findUnique({
            where: { user_id: userId },
          })

          const notification = await prisma.notification.create({
            data: {
              user_id: post.user_id,
              avatar: profile?.profile_picture_url,
              type: "LIKE",
              message: `${profile?.first_name} ${profile?.last_name} Someone liked your post!`,
              metadata: { postId: post.id, likerId: userId },
            },
          })

          await pusher.trigger(`user-${post.user_id}`, "notification", {
            id: notification.id,
            avatar: profile?.profile_picture_url,
            message: notification.message,
            type: notification.type,
            metadata: notification.metadata,
            created_at: notification.created_at,
          });
        }
      }
    });

    return res.status(200).json(createSuccessResponse(responseData.data, responseData.message));
  } catch (error) {
    next(error);
  }
};


module.exports = {
  deletePost,
  createPost,
  deletePost,
  getAllVisiblePublicPost,
  likePost,
  updatePost,
};
