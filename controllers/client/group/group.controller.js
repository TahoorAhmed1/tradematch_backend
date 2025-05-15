const { pusher } = require("../../../configs/pusher");
const { prisma } = require("../../../configs/prisma");
const {
  createSuccessResponse,
  updateSuccessResponse,
  badRequestResponse,
  okResponse,
} = require("../../../constants/responses");
const {
  deleteCloudinaryImage,
  uploadImageFromBuffer,
} = require("../../../middlewares/uploadPicture.middleware");
const { logger } = require("../../../configs/logger");

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
            status: "ACCEPTED",
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
  const { group_id } = req.params;
  const { name, description, category, location, is_private } = req.body;
  try {
    const group = await prisma.group.findUnique({ where: { id: group_id } });
    if (!group)
      return res.status(404).json(badRequestResponse("Group not found."));

    let data = { name, description, category, location };

    const coverPic = req.files?.find((f) => f.fieldname === "cover_image_url");
    if (coverPic) {
      if (group.cover_image_url)
        await deleteCloudinaryImage(group.cover_image_url);
      data.cover_image_url = await uploadImageFromBuffer(coverPic);
    }

    const updated = await prisma.group.update({
      where: { id: group_id },
      data: {
        ...data,
        is_private: JSON.parse(is_private)
      },
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
  const { userId } = req.user;
  try {
    const group = await prisma.group.findUnique({
      where: { id: id },
      include: {
        members: {
          where: {
            status: "ACCEPTED",
          },
        },
        posts: {
          include: {
            post: true,
          },
        },
        creator: {
          include: {
            profile: true,
          },
        },
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
        status: "ACCEPTED",
      },
    });

    const response = {
      ...group,
      isJoined: !!isMember,
      isAdmin: group.creator_id === userId,
    };
    return res.status(200).json(okResponse(response));
  } catch (error) {
    next(error);
  }
};

const getAllJoinRequestsForAdmin = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const groups = await prisma.group.findMany({
      where: {
        creator_id: userId,
        is_deleted: false,
      },
      select: { id: true },
    });

    const groupIds = groups.map((g) => g.id);

    const requests = await prisma.group_member.findMany({
      where: {
        group_id: { in: groupIds },
        status: "PENDING",
        is_deleted: false,
      },
      include: {
        user: {
          include: { profile: true },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json(okResponse(requests));
  } catch (error) {
    logger.info('error', error)
    next(error);
  }
};

const updateRequestStatus = async (req, res, next) => {
  const { status, groupId, userId: targetUserId } = req.body;
  const { userId: adminId } = req.user;

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    if (group.creator_id !== adminId) {
      return res.status(403).json({ message: "Unauthorized: Not the group creator." });
    }

    const updated = await prisma.group_member.updateMany({
      where: {
        group_id: groupId,
        user_id: targetUserId,
        status: "PENDING",
        is_deleted: false,
      },
      data: {
        status,
        joined_at: new Date(),
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "No pending request found for this user." });
    }

    return res.status(200).json({
      success: true,
      message: `User request ${status.toLowerCase()} successfully.`,
    });
  } catch (error) {
    next(error);
  }
};



const getAllGroupPost = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Fetch original posts in the group
    const posts = await prisma.post.findMany({
      where: {
        group_posts: {
          some: { group_id: id },
        },
        visibility: "GROUP_ONLY",
        is_deleted: false,
      },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        content: true,
        visibility: true,
        is_deleted: true,
        created_at: true,
        updated_at: true,
        attachments: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        likes: true,
        comments: {
          where: { is_deleted: false },
          select: {
            id: true,
            content: true,
            parent_id: true,
            created_at: true,
            updated_at: true,
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    // Fetch shares made into the group, and ensure original post is not deleted
    const shares = await prisma.share.findMany({
      where: {
        group_id: id,
        is_deleted: false,
        post: {
          is_deleted: false,
        },
      },
      select: {
        id: true,
        created_at: true,
        shared_by: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            visibility: true,
            is_deleted: true,
            created_at: true,
            updated_at: true,
            attachments: true,
            user: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
            likes: true,
            comments: {
              where: { is_deleted: false },
              select: {
                id: true,
                content: true,
                parent_id: true,
                created_at: true,
                updated_at: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    profile: true,
                  },
                },
              },
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

    // Format original posts
    const formattedPosts = posts.map((post) => ({
      ...post,
      comments: buildNestedComments(post.comments),
      is_share: false,
      share_info: null,
    }));

    // Format shared posts
    const formattedSharedPosts = shares
      .filter((share) => share.post)
      .map((share) => ({
        ...share.post,
        comments: buildNestedComments(share.post.comments),
        is_share: true,
        share_info: {
          share_id: share.id,
          shared_by: share.shared_by,
          shared_at: share.created_at,
        },
      }));

    // Combine and sort by created_at / shared_at descending
    const combinedPosts = [...formattedPosts, ...formattedSharedPosts];
    combinedPosts.sort((a, b) => {
      const dateA = a.is_share ? new Date(a.share_info.shared_at) : new Date(a.created_at);
      const dateB = b.is_share ? new Date(b.share_info.shared_at) : new Date(b.created_at);
      return dateB - dateA;
    });

    const response = okResponse(combinedPosts);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};



const getAllGroups = async (req, res, next) => {
  try {
    const groups = await prisma.group.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json(okResponse(groups));
  } catch (error) {
    next(error);
  }
};




const permanentDeleteGroup = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          where: {
            user_id: userId,
            role: { in: ["ADMIN"] },
          },
        },
      },
    });

    if (!group) {
      return res.status(404).json(badRequestResponse("Group not found."));
    }

    if (group.creator_id !== userId) {
      return res.status(403).json(
        badRequestResponse("Only the group creator can permanently delete this group.")
      );
    }

    const groupMembers = await prisma.group_member.findMany({
      where: {
        group_id: id,
        status: "ACCEPTED",
        user_id: { not: userId },
      },
      include: {
        user: true,
      },
    });

    const deletingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    await prisma.group_post.deleteMany({
      where: { group_id: id },
    });

    await prisma.group_member.deleteMany({
      where: { group_id: id },
    });

    await prisma.share.deleteMany({
      where: { group_id: id },
    });

    await prisma.group.delete({
      where: { id },
    });

    for (const member of groupMembers) {
      const notification = await prisma.notification.create({
        data: {
          user_id: member.user_id,
          avatar: deletingUser?.profile?.profile_picture_url,
          type: "ADMIN_ANNOUNCEMENT",
          message: `The group "${group.name}" has been permanently deleted by ${deletingUser?.profile?.first_name} ${deletingUser?.profile?.last_name}.`,
          metadata: {
            groupId: id,
          },
        },
      });

      await pusher.trigger(`user-${member?.user_id}`, "notification", {
        id: notification.id,
        avatar: deletingUser?.profile?.profile_picture_url,
        message: `The group "${group.name}" has been permanently deleted by ${deletingUser?.profile?.first_name} ${deletingUser?.profile?.last_name}.`,
        type: "ADMIN_ANNOUNCEMENT",
        metadata: {
          groupId: id,
        },
        created_at: notification.created_at,
      });
    }

    return res.status(200).json(
      createSuccessResponse(
        null,
        "Group has been permanently deleted."
      )
    );

  } catch (error) {
    console.error(error);
    next(error);
  }
};




const joinGroup = async (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        is_deleted: false,
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json(badRequestResponse("User not found or deleted."));
    }

    const group = await prisma.group.findUnique({
      where: {
        id,
        is_deleted: false,
      },
      include: {
        creator: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!group) {
      return res
        .status(404)
        .json(badRequestResponse("Group not found or deleted."));
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
      if (existingMember.status === "PENDING") {
        return res
          .status(400)
          .json(badRequestResponse("Your request is pending approval."));
      }
      return res
        .status(400)
        .json(badRequestResponse("You are already a member of this group."));
    }

    await prisma.group_member.create({
      data: {
        group_id: id,
        user_id: userId,
        role: "MEMBER",
        status: group.is_private ? "PENDING" : "ACCEPTED",
      },
    });

    if (group.is_private) {
      const notification = await prisma.notification.create({
        data: {
          user_id: group.creator_id,
          avatar: user.profile?.profile_picture_url,
          type: "GROUP_INVITE",
          message: `${user.profile?.first_name} ${user.profile?.last_name} has requested to join your group "${group.name}".`,
          metadata: {
            groupId: id,
            userId: userId,
          },
        },
      });

      await pusher.trigger(`user-${group.creator_id}`, "notification", {
        id: notification.id,
        avatar: user.profile?.profile_picture_url,
        message: `${user.profile?.first_name} ${user.profile?.last_name} has requested to join your group "${group.name}".`,
        type: "GROUP_INVITE",
        metadata: {
          groupId: id,
          userId: userId,
        },
        created_at: notification.created_at,
        is_read: false,
      });
    }

    return res
      .status(200)
      .json(
        createSuccessResponse(
          group.is_private
            ? "Your request to join the group has been sent."
            : "Successfully joined the group."
        )
      );
  } catch (error) {
    console.error(error);
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
      return res
        .status(400)
        .json({ message: "You are not a member of this group." });
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
        attachments: attachment
          ? { connect: { id: attachment.id } }
          : undefined,
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

    return res
      .status(201)
      .json(createSuccessResponse(post, "Group post created successfully."));
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
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        group_posts: {
          include: {
            group: true,
          },
        },
        attachments: true,
      },
    });

    if (!originalPost) {
      return res
        .status(404)
        .json(badRequestResponse("Original post not found."));
    }

    const groupAssoc = originalPost.group_posts?.[0];
    if (groupAssoc && groupAssoc.group?.is_private) {
      return res
        .status(403)
        .json(badRequestResponse("Cannot share posts from private groups."));
    }

    const group = await prisma.group.findUnique({
      where: { id: group_id },
    });

    if (!group || group.is_deleted) {
      return res
        .status(404)
        .json(badRequestResponse("Group not found or deleted."));
    }

    const member = await prisma.group_member.findUnique({
      where: {
        group_id_user_id: {
          group_id,
          user_id: userId,
        },
      },
    });

    if (!member || member.status !== "ACCEPTED") {
      return res
        .status(403)
        .json(
          badRequestResponse("You are not an accepted member of this group.")
        );
    }

    const sharingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    const sharedPost = await prisma.post.create({
      data: {
        user_id: userId,
        content: content || originalPost.content,
        visibility: "GROUP_ONLY",
        attachments: {
          createMany: {
            data:
              originalPost.attachments?.map((file) => ({
                url: file.url,
                type: file.type,
                filename: file.filename,
                size: file.size,
                mimeType: file.mimeType,
              })) || [],
          },
        },
      },
      include: {
        attachments: true,
      },
    });

    await prisma.share.create({
      data: {
        post_id: post_id,
        shared_by_id: userId,
        group_id: group_id,
        content: content || null,
      },
    });

    await prisma.group_post.create({
      data: {
        group_id,
        post_id: sharedPost.id,
      },
    });
    if (originalPost.user_id !== userId) {
      const notification = await prisma.notification.create({
        data: {
          user_id: originalPost.user_id,
          avatar: sharingUser?.profile?.profile_picture_url,
          type: "SHARE",
          message: `${sharingUser?.profile?.first_name} ${sharingUser?.profile?.last_name} shared your post to ${group.name}.`,
          metadata: {
            postId: post_id,
            sharedPostId: sharedPost.id,
            groupId: group_id,
          },
        },
      });

      await pusher.trigger(`user-${originalPost.user_id}`, "notification", {
        id: notification.id,
        avatar: sharingUser?.profile?.profile_picture_url,
        message: `${sharingUser?.profile?.first_name} ${sharingUser?.profile?.last_name} shared your post to ${group.name}.`,
        type: "SHARE",
        metadata: {
          postId: post_id,
          sharedPostId: sharedPost.id,
          groupId: group_id,
        },
        created_at: notification.created_at,
      });
    }

    return res
      .status(201)
      .json(
        createSuccessResponse(
          "Post shared successfully to the group.",
          sharedPost
        )
      );
  } catch (error) {
    next(error);
  }
};

const UserGroups = async (req, res, next) => {
  const { userId } = req.user
  try {

    const group = await prisma.group.findUnique({
      where: { creator_id: userId },
      include: {
        members: {
          where: {
            status: "ACCEPTED",
          },
        },

        creator: {
          include: {
            profile: true,
          },
        },
      },
    });
    return res.status(200).json(okResponse(group));
  } catch (error) {
    next(error);
  }

}


const getUserAllGroups = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            user_id: userId,
            status: "ACCEPTED",
            is_deleted: false,
          },
        },
        is_deleted: false,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        members: {
          where: {
            status: "ACCEPTED"
          }
        }
      }
    });

    return res.status(200).json(okResponse(groups));
  } catch (error) {
    next(error);
  }
};


module.exports = {
  UserGroups,
  getUserAllGroups,
  permanentDeleteGroup,
  createGroupPost,
  createGroup,
  leaveGroup,
  updateGroup,
  getGroup,
  getAllGroups,
  joinGroup,
  getAllGroupPost,
  sharePostToGroup,
  getAllJoinRequestsForAdmin,
  updateRequestStatus
};
