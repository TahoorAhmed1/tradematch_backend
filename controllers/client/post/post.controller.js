const { prisma } = require("@/configs/prisma");
const {
  createSuccessResponse,
  okResponse,
  updateSuccessResponse,
  deleteSuccessResponse,
} = require("@/constants/responses");
const {
  uploadImageFromBuffer,
  deleteCloudinaryImage,
} = require("@/middlewares/uploadPicture.middleware");

const createPost = async (req, res, next) => {
  const { userId } = req.user;
  const { content } = req.body;

  try {
    let attachments = [];

    if (req?.files && req?.files?.length > 0) {
      const uploads = await Promise.all(
        req.files.map(async (file) => {
          const url = await uploadImageFromBuffer(file);
          return {
            url,
            type: file.mimetype.includes("image")
              ? "IMAGE"
              : file.mimetype.includes("pdf")
              ? "PDF"
              : file.mimetype.includes("text")
              ? "TEXT"
              : file.mimetype.includes("spreadsheet")
              ? "SPREADSHEET"
              : file.mimetype.includes("video")
              ? "VIDEO"
              : "TEXT",
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          };
        })
      );

      attachments = await prisma.$transaction(
        uploads.map((fileData) => prisma.file.create({ data: fileData }))
      );
    }

    const newPost = await prisma.post.create({
      data: {
        user_id: userId,
        content,
        attachments: attachments.length
          ? {
              connect: attachments?.map((file) => ({ id: file.id })),
            }
          : {},
      },
      include: {
        attachments: true,
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
    });

    if (!post || post.is_deleted) {
      return res.status(404).json(badRequestResponse("Post not found."));
    }

    const existing = await prisma.like.findUnique({
      where: {
        user_id_post_id: {
          user_id: userId,
          post_id,
        },
      },
    });

    if (existing) {
      const like = await prisma.like.delete({
        where: {
          user_id_post_id: {
            user_id: userId,
            post_id,
          },
        },
      });
      return res
        .status(200)
        .json(createSuccessResponse(like, "Post unlike successfully."));
    }

    const like = await prisma.like.create({
      data: {
        user_id: userId,
        post_id,
      },
    });

    return res
      .status(200)
      .json(createSuccessResponse(like, "Post liked successfully."));
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
