const { prisma } = require("../../../configs/prisma");
const redis = require("../../../configs/redis");
const {
  badRequestResponse,
  createSuccessResponse,
  updateSuccessResponse,
  okResponse,
} = require("../../../constants/responses");
const {
  uploadImageFromBuffer,
  deleteCloudinaryImage,
} = require("../../../middlewares/uploadPicture.middleware");

const createProfile = async (req, res, next) => {
  const { userId } = req.user;
  const { industry_subcategory_ids, ...data } = req.body;

  try {
    const existing = await prisma.profile.findUnique({
      where: { user_id: userId },
    });
    if (existing)
      return res
        .status(400)
        .json(badRequestResponse("Profile already exists."));

    const profilePic = req.files?.find(
      (f) => f.fieldname === "profile_picture"
    );
    const coverPic = req.files?.find((f) => f.fieldname === "cover_picture");

    if (profilePic)
      data.profile_picture_url = await uploadImageFromBuffer(profilePic);
    if (coverPic)
      data.cover_picture_url = await uploadImageFromBuffer(coverPic);

    const profile = await prisma.profile.create({
      data: {
        ...data,
        user_id: userId,
        industry_subcategories: industry_subcategory_ids?.length
          ? {
            set: [],
            connect: industry_subcategory_ids.map((id) => ({ id })),
          }
          : {},
      },
    });

    const response = createSuccessResponse(profile);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const { userId } = req.user;
  const { industry_subcategory_ids = [], ...data } = req.body;

  try {
    const profile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      return res.status(404).json(badRequestResponse("Profile not found."));
    }

    const profilePic = req.files?.find(
      (f) => f.fieldname === "profile_picture_url"
    );
    if (profilePic) {
      if (profile.profile_picture_url) {
        await deleteCloudinaryImage(profile.profile_picture_url);
      }
      data.profile_picture_url = await uploadImageFromBuffer(profilePic);
    }

    const coverPic = req.files?.find(
      (f) => f.fieldname === "cover_picture_url"
    );
    if (coverPic) {
      if (profile.cover_picture_url) {
        await deleteCloudinaryImage(profile.cover_picture_url);
      }
      data.cover_picture_url = await uploadImageFromBuffer(coverPic);
    }

    await prisma.profile.update({
      where: { user_id: userId },
      data: {
        ...data,
        industry_subcategories: industry_subcategory_ids.length
          ? {
            set: [],
            connect: industry_subcategory_ids.map((id) => ({ id })),
          }
          : undefined,
      },
      include: {
        user: true,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const cacheKey = `user:${userId}`;
    await redis.set(cacheKey, JSON.stringify(updatedUser), { EX: 300 });

    return res.status(200).json(updateSuccessResponse(updatedUser));
  } catch (error) {
    next(error);
  }
};

const getAllProfile = async (req, res, next) => {
  const userId = req.user.userId;

  try {
    // Get all pending requests you sent
    const pendingRequests = await prisma.connection.findMany({
      where: {
        sender_id: userId,
        status: "PENDING",
      },
      select: {
        receiver_id: true,
      },
    });

    const pendingReceiverIds = pendingRequests.map((r) => r.receiver_id);

    // Fetch profiles except your own
    const profiles = await prisma.profile.findMany({
      where: {
        user_id: {
          not: userId,
        },
      },
      include: {
        user: {
          include: {
            connections_sent: {
              where: {
                status: "ACCEPTED",
              },
              select: {
                receiver_id: true,
              },
            },
            connections_received: {
              where: {
                status: "ACCEPTED",
              },
              select: {
                sender_id: true,
              },
            },
          },
        },
      },
    });

    // Map profiles and check connection status with your userId
    const enrichedProfiles = profiles.map((profile) => {
      const sentConnections = profile.user.connections_sent || [];
      const receivedConnections = profile.user.connections_received || [];

      // Calculate total accepted connections this profile has
      const connectionCount = sentConnections.length + receivedConnections.length;

      // Check if you sent a pending request to this user
      const request = pendingReceiverIds.includes(profile.user_id);

      // Check if there is an accepted connection between your userId and this profile.user_id
      const isConnected =
        sentConnections.some((conn) => conn.receiver_id === userId) ||
        receivedConnections.some((conn) => conn.sender_id === userId);

      return {
        ...profile,
        connectionCount,
        request,
        isConnected,
      };
    });
    const response = okResponse(enrichedProfiles);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};


const searchProfiles = async (req, res, next) => {
  const userId = req.user.userId;
  const { query } = req.query;

  try {
    const profiles = await prisma.profile.findMany({
      where: {
        user_id: {
          not: userId,
        },
        OR: [
          { first_name: { contains: query, mode: "insensitive" } },
          { last_name: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        user: {
          include: {
            connections_sent: {
              where: {
                status: "ACCEPTED",
              },
              select: { id: true },
            },
            connections_received: {
              where: {
                status: "ACCEPTED",
              },
              select: { id: true },
            },
          },
        },
      },
    });

    const enrichedProfiles = profiles.map((profile) => {
      const sent = profile.user.connections_sent?.length || 0;
      const received = profile.user.connections_received?.length || 0;

      return {
        ...profile,
        connectionCount: sent + received,
      };
    });
    const response = okResponse(enrichedProfiles);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const getProfilesById = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const profile = await prisma.profile.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          include: {
            posts: {
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
            },
            connections_sent: {
              select: {
                status: true,
                receiver_id: true,
              },
            },
            connections_received: {
              select: {
                status: true,
                sender_id: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // 🔄 Find direct connection (regardless of direction)
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { sender_id: userId, receiver_id: profile.user.id },
          { sender_id: profile.user.id, receiver_id: userId },
        ],
        is_deleted: false,
      },
      select: {
        id: true,
        sender_id: true,
        receiver_id: true,
        status: true,
        created_at: true,
      },
    });

    // 🔍 Determine connection direction and status
    const hasSent =
      connection?.sender_id === userId && connection?.status === "PENDING";
    const hasReceived =
      connection?.receiver_id === userId && connection?.status === "PENDING";
    const hasConnection = connection?.status === "ACCEPTED";

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

    const posts =
      profile.user.posts?.map((post) => ({
        ...post,
        comments: buildNestedComments(post.comments),
      })) || [];

    const response = okResponse({
      ...profile,
      user: {
        ...profile.user,
        posts,
        connectionStatus: hasConnection,
        hasSent,
        hasReceived,
        connectionId: connection?.id || null,
      },
    });
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};


const searchGroupAndProfiles = async (req, res, next) => {
  const userId = req.user.userId;
  const { query } = req.query;

  try {



    const user = await prisma.profile.findMany({
      where: {
        user_id: {
          not: userId,
        },

        OR: [
          { first_name: { contains: query, mode: "insensitive" } },
          { last_name: { contains: query, mode: "insensitive" } },
        ],


      },
    });


    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],

      },
      orderBy: {
        created_at: "desc"
      },
      include: {
        members: {
          where: {
            role: "ADMIN"
          },
          select: {
            user: {
              select: {
                profile: true
              }
            }
          }
        }
      }

    });


    console.log('groups', groups)
    const response = okResponse({ user, groups });
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};



module.exports = { createProfile, updateProfile, getAllProfile, searchProfiles, searchGroupAndProfiles, getProfilesById };
