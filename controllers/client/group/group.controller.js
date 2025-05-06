const { prisma } = require("../../../configs/prisma");
const {
  createSuccessResponse,
  updateSuccessResponse,
  okResponse,
} = require("../../../constants/responses");
const {
  deleteCloudinaryImage,
  uploadImageFromBuffer,
} = require("../../../middlewares/uploadPicture.middleware");

const createGroup = async (req, res, next) => {
  const { userId } = req.user;
  const { name, description, category, location, is_private } = req.body;

  try {
    let cover_image_url;
    const coverPic = req.files?.find((f) => f.fieldname === "cover_image_url");
    if (coverPic) {
      cover_image_url = await uploadImageFromBuffer(coverPic);
    }
    const isPrivateBoolean = JSON.parse(is_private);
    const group = await prisma.group.create({
      data: {
        name,
        description,
        category,
        location,
        is_private: isPrivateBoolean,
        cover_image_url,
        creator_id: userId,
        members: {
          create: {
            user_id: userId,
            role: "ADMIN",
            status: "ACCEPTED"
          },
        },
      },
    });

    const response = createSuccessResponse(group, "Group created successfully.");
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};
;

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


const getGroup = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user
  try {
    const group = await prisma.group.findUnique({
      where: { id: id },
      include: {
        members: {
          where: {
            status: "ACCEPTED"
          }
        },
        posts: {
          include: {
            post: true
          }
        },
        creator: {
          include: {
            profile: true
          }
        }
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const isMember = await prisma.group_member.findFirst({
      where: {
        group_id: id,
        user_id: userId,
        is_deleted: false,
        status: "ACCEPTED"
      },
    });

    const response = {
      ...group,
      isJoined: !!isMember,
      isAdmin: group.creator_id === userId
    };
    return res.status(200).json(okResponse(response));
  } catch (error) {
    next(error);
  }
};

const getAllGroupPost = async (req, res, next) => {
  const { id } = req.params
  try {
    const posts = await prisma.post.findMany({
      where: {
        group_posts: {
          some: {
            group_id: id,
          },
        },
        visibility: "GROUP_ONLY",
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

const getAllGroups = async (req, res, next) => {
  try {
    const groups = await prisma.group.findMany({
      orderBy: {
        created_at: "desc"
      }
    });

    return res.status(200).json(okResponse(groups));
  } catch (error) {
    next(error);
  }
};

const joinGroup = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const existingMember = await prisma.group_member.findUnique({
      where: {
        group_id_user_id: {
          group_id: id,
          user_id: userId,
        },

      },
    });

    if (existingMember) {
      return res.status(400).json({ message: "Already a member of the group." });
    }

    await prisma.group_member.create({
      data: {
        group_id: id,
        user_id: userId,
        role: "MEMBER",
        status: group.is_private ? "PENDING" : "ACCEPTED",
      },
    });

    return res.status(200).json({ message: "Successfully joined the group." });
  } catch (error) {
    next(error);
  }
};

const leaveGroup = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const group = await prisma.group.findUnique({
      where: { id: id },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const membership = await prisma.group_member.findFirst({
      where: {
        group_id: id,
        user_id: userId,
      },
    });

    if (!membership) {
      return res.status(400).json({ message: "You are not a member of this group." });
    }

    await prisma.group_member.delete({
      where: {
        id: membership.id,
      },
    });

    return res.status(200).json({ message: "Successfully left the group." });
  } catch (error) {
    next(error);
  }
};

const createGroupPost = async (req, res, next) => {
  const { userId } = req.user;
  const { content, group_id } = req.body;

  try {
    const group = await prisma.group.findFirst({
      where: { id: group_id, is_deleted: false },
    });

    if (!group) {
      return res.status(404).json(badRequestResponse("Group not found."));
    }

    let attachment = null;
    const file = req?.files?.[0];

    if (file) {
      const url = await uploadImageFromBuffer(file);
      attachment = await prisma.file.create({
        data: {
          url,
          type: file.mimetype.includes("image")
            ? "IMAGE"
            : file.mimetype.includes("video")
              ? "VIDEO"
              : "TEXT",
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      });
    }

    const post = await prisma.post.create({
      data: {
        user_id: userId,
        content,
        visibility: "GROUP_ONLY",
        attachments: attachment ? { connect: { id: attachment.id } } : undefined,
        group_posts: {
          create: {
            group_id,
          },
        },
      },
      include: {
        attachments: true,
        group_posts: true,
      },
    });

    return res.status(201).json(createSuccessResponse(post, "Group post created successfully."));
  } catch (error) {
    next(error);
  }
};


const sharePostToGroup = async (req, res, next) => {
  const { userId } = req.user;
  const { post_id, group_id, content } = req.body;

  try {
    const originalPost = await prisma.post.findUnique({
      where: { id: post_id },
    });

    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found." });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group || group.is_deleted) {
      return res.status(404).json({ message: "Group not found or deleted." });
    }

    const member = await prisma.group_member.findUnique({
      where: {
        group_id_user_id: {
          group_id: group_id,
          user_id: userId,
        },
      },
    });

    if (!member || member.status !== "ACCEPTED") {
      return res.status(403).json({ message: "You are not an accepted member of this group." });
    }

    const sharedPost = await prisma.post.create({
      data: {
        user_id: userId,
        content: content || originalPost.content,
        visibility: "GROUP_ONLY",
        attachments: {
          createMany: {
            data: originalPost.attachments.map(file => ({
              url: file.url,
              type: file.type,
              filename: file.filename,
              size: file.size,
              mimeType: file.mimeType,
            })),
          },
        },
      },
      include: {
        attachments: true,
      },
    });

    await prisma.share.create({
      data: {
        post_id: originalPost.id,
        shared_by_id: userId,
        group_id: groupId,
        content: content || null,
      },
    });

    await prisma.group_post.create({
      data: {
        group_id: group_id,
        post_id: sharedPost.id,
      },
    });

    return res.status(201).json({
      message: "Post shared successfully to the group.",
      sharedPost,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};







module.exports = {
  createGroupPost,
  createGroup,
  leaveGroup,
  updateGroup,
  getGroup,
  getAllGroups,
  joinGroup,
  getAllGroupPost,
  sharePostToGroup
};
