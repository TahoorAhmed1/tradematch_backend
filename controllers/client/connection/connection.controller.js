// controllers/client/connectionController.js
const { pusher } = require("../../../configs/pusher");
const { prisma } = require("../../../configs/prisma");
const {
  badRequestResponse,
  createSuccessResponse,
  updateSuccessResponse,
  okResponse,
  notFoundResponse,
} = require("../../../constants/responses");

// send connection request
const sendConnection = async (req, res, next) => {
  const { userId } = req.user;
  const { receiver_id } = req.body;

  try {
    if (receiver_id === userId) {
      return res.status(400).json(badRequestResponse("You cannot connect with yourself."));
    }

    const existing = await prisma.connection.findFirst({
      where: {
        sender_id: userId,
        receiver_id,
        is_deleted: false,
      },
    });

    if (existing) {
      return res.status(400).json(badRequestResponse("Connection request already sent."));
    }

    const connection = await prisma.connection.create({
      data: {
        sender_id: userId,
        receiver_id,
        status: "PENDING",
      },
    });

    const senderProfile = await prisma.profile.findUnique({ where: { user_id: userId } });

    const notification = await prisma.notification.create({
      data: {
        user_id: receiver_id,
        avatar: senderProfile?.profile_picture_url,
        type: "CONNECTION_REQUEST",
        message: `${senderProfile?.first_name} ${senderProfile?.last_name} sent you a connection request!`,
        metadata: { senderId: userId },
      },
    });

    await pusher.trigger(`user-${receiver_id}`, "notification", notification);

    return res.status(201).json(createSuccessResponse(connection, "Connection request sent."));
  } catch (error) {
    next(error);
  }
};


const cancelRequest = async (req, res, next) => {
  const { userId } = req.user;
  const { receiver_id } = req.body;

  try {
    const connection = await prisma.connection.findFirst({
      where: {
        sender_id: userId,
        receiver_id,
        status: "PENDING",
      },
    });

    if (!connection) {
      return res.status(404).json(badRequestResponse("No pending connection request found to cancel."));
    }

    await prisma.connection.delete({
      where: { id: connection.id },
    });

    return res.status(200).json(createSuccessResponse(null, "Connection request declined and deleted."));
  } catch (error) {
    next(error);
  }
};

const unFriendRequest = async (req, res, next) => {
  const { connection_id } = req.params;

  try {
    const connection = await prisma.connection.findFirst({
      where: {
        id: connection_id
      },
    });

    if (!connection) {
      return res.status(404).json(badRequestResponse("No pending connection request found to unfriend."));
    }

    await prisma.connection.delete({
      where: { id: connection.id },
    });

    return res.status(200).json(createSuccessResponse(null, "Connection request declined and deleted."));
  } catch (error) {
    next(error);
  }
};


const acceptConnection = async (req, res, next) => {
  const { userId } = req.user;
  const { connection_id } = req.params;

  try {
    const connection = await prisma.connection.findUnique({ where: { id: connection_id } });

    if (!connection || connection.is_deleted) {
      return res.status(404).json(notFoundResponse("Connection not found."));
    }

    if (connection.receiver_id !== userId) {
      return res.status(403).json(badRequestResponse("You are not authorized to accept this connection."));
    }

    if (connection.status === "ACCEPTED") {
      return res.status(400).json(badRequestResponse("Connection already accepted."));
    }

    const updated = await prisma.connection.update({
      where: { id: connection_id },
      data: { status: "ACCEPTED" },
    });

    const receiverProfile = await prisma.profile.findUnique({ where: { user_id: userId } });

    const notification = await prisma.notification.create({
      data: {
        user_id: connection.sender_id,
        avatar: receiverProfile?.profile_picture_url,
        type: "CONNECTION_ACCEPTED",
        message: `${receiverProfile?.first_name} ${receiverProfile?.last_name} accepted your connection request!`,
        metadata: { senderId: userId },
      },
    });

    await pusher.trigger(`user-${connection.sender_id}`, "notification", notification);

    return res.status(200).json(updateSuccessResponse(updated, "Connection accepted successfully."));
  } catch (error) {
    next(error);
  }
};

// reject connection request
const rejectConnection = async (req, res, next) => {
  const { userId } = req.user;
  const { connection_id } = req.params;

  try {
    const connection = await prisma.connection.findUnique({ where: { id: connection_id } });

    if (!connection || connection.is_deleted) {
      return res.status(404).json(notFoundResponse("Connection not found."));
    }

    if (connection.receiver_id !== userId) {
      return res.status(403).json(badRequestResponse("You are not authorized to reject this connection."));
    }



    const updated = await prisma.connection.delete({
      where: { id: connection_id },
    });

    return res.status(200).json(updateSuccessResponse(updated, "Connection rejected successfully."));
  } catch (error) {
    next(error);
  }
};

// get all sent connection requests
const getAllSendConnection = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const connections = await prisma.connection.findMany({
      where: {
        sender_id: userId,
        status: "PENDING",
      },
      include: {
        receiver: {
          include: {
            profile: true,
          },
        },
      },
    });

    return res.status(200).json(okResponse(connections));
  } catch (error) {
    next(error);
  }
};

// get all received pending requests
const getAllPendingConnection = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const connections = await prisma.connection.findMany({
      where: {
        receiver_id: userId,
        status: "PENDING",
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
      },
    });

    return res.status(200).json(okResponse(connections));
  } catch (error) {
    next(error);
  }
};

// get all confirmed connections (excluding blocks)
const getAllConfirmConnection = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const blockedRecords = await prisma.block.findMany({
      where: {
        OR: [
          { blocker_id: userId },
          { blocked_id: userId },
        ],
      },
      select: { connection_id: true },
    });

    const blockedConnectionIds = blockedRecords.map(b => b.connection_id);

    const connections = await prisma.connection.findMany({
      where: {
        status: "ACCEPTED",
        is_deleted: false,
        OR: [
          { sender_id: userId },
          { receiver_id: userId },
        ],
        id: { notIn: blockedConnectionIds },
      },
      include: {
        sender: {
          include: {
            profile: true,
            connections_sent: {
              where: { status: "ACCEPTED" },
              select: { id: true },
            },
            connections_received: {
              where: { status: "ACCEPTED" },
              select: { id: true },
            },
          },
        },
        receiver: {
          include: {
            profile: true,
            connections_sent: {
              where: { status: "ACCEPTED" },
              select: { id: true },
            },
            connections_received: {
              where: { status: "ACCEPTED" },
              select: { id: true },
            },
          },
        },
      },
    });

    const result = connections.map(conn => {
      const isSender = conn.sender_id === userId;
      const otherUser = isSender ? conn.receiver : conn.sender;
      const totalConnections =
        (otherUser.connections_sent?.length || 0) +
        (otherUser.connections_received?.length || 0);

      return {
        id: conn.id,
        user_id: otherUser.id,
        profile: otherUser.profile,
        connectionCount: totalConnections,
      };
    });

    return res.status(200).json(okResponse(result));
  } catch (error) {
    next(error);
  }
};




const toggleBlockConnection = async (req, res, next) => {
  const { userId } = req.user;
  const { connection_id } = req.params;
  const { block } = req.body;

  try {

    const profile = await prisma.profile.findUnique({
      where: {
        user_id: userId,

      },
    });
    const connection = await prisma.connection.findUnique({
      where: { id: connection_id },
      include: {
        sender: { select: { profile: { select: { first_name: true, last_name: true, profile_picture_url: true } } } },
        receiver: { select: { profile: { select: { first_name: true, last_name: true, profile_picture_url: true } } } }
      }
    });

    if (!connection || connection.is_deleted) {
      return res.status(404).json(notFoundResponse("Connection not found."));
    }

    const isParticipant =
      connection.sender_id === userId || connection.receiver_id === userId;

    if (!isParticipant) {
      return res
        .status(403)
        .json(badRequestResponse("Not authorized to block this connection."));
    }



    if (block) {
      const existingBlock = await prisma.block.findUnique({
        where: {
          blocker_id_blocked_id: {
            blocker_id: userId,
            blocked_id: connection.sender_id === userId ? connection.receiver_id : connection.sender_id,
          },
        },
      });

      if (existingBlock) {
        return res.status(400).json(badRequestResponse("User already blocked."));
      }

      const newBlock = await prisma.block.create({
        data: {
          connection_id: connection.id,
          blocker_id: userId,
          blocked_id: connection.sender_id === userId ? connection.receiver_id : connection.sender_id,
        },
      });


      const notification = await prisma.notification.create({
        data: {
          user_id: connection.sender_id === userId ? connection.receiver_id : connection.sender_id,
          avatar: profile.profile_picture_url,
          type: "CONNECTION_REQUEST",
          message: `${profile.first_name} ${profile.last_name} has blocked you.`,
          metadata: {
            senderId: userId,
            action: "block",
          },
        },
      });

      await pusher.trigger(`user-${connection.sender_id === userId ? connection.receiver_id : connection.sender_id}`, "notification", {
        id: notification.id,
        avatar: profile.profile_picture_url,
        message: `${profile.first_name} ${profile.last_name} has blocked you.`,
        type: notification.type,
        metadata: notification.metadata,
        created_at: notification.created_at,
      });

      return res.status(200).json(updateSuccessResponse(newBlock, "User blocked successfully."));
    } else {
      await prisma.block.delete({
        where: {
          blocker_id_blocked_id: {
            blocker_id: userId,
            blocked_id: connection.sender_id === userId ? connection.receiver_id : connection.sender_id,
          },
        },
      });

      return res.status(200).json(updateSuccessResponse(null, "User unblocked successfully."));
    }
  } catch (error) {
    next(error);
  }
};

const getAllBlockConnection = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const blockedConnections = await prisma.block.findMany({
      where: {
        OR: [
          { blocker_id: userId },
          { blocked_id: userId },
        ],
      },
      include: {
        blocker: {
          include: {
            profile: true,
          },
        },
        blocked: {
          include: {
            profile: true,
          },
        },
        connection: {
          include: {
            sender: {
              include: {
                profile: true,
              },
            },
            receiver: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    const validConnections = blockedConnections
      .filter((block) => block.connection.status === "ACCEPTED" && !block.connection.is_deleted)
      .map((block) => {
        const otherUser = block.blocker_id === userId ? block.blocked : block.blocker;

        return {
          id: block.id,
          connection_id: block.connection_id,
          blocker_id: block.blocker_id,
          blocked_id: block.blocked_id,
          created_at: block.created_at,
          updated_at: block.updated_at,
          connection: {
            ...block.connection,
            isBlockedByMe: block.blocker_id === userId,
            otherUser: otherUser,
          }
        };
      });

    return res.status(200).json(okResponse(validConnections));
  } catch (error) {
    next(error);
  }
};






module.exports = {
  getAllSendConnection,
  sendConnection,
  acceptConnection,
  toggleBlockConnection,
  getAllPendingConnection,
  getAllConfirmConnection,
  getAllBlockConnection,
  rejectConnection,
  cancelRequest,
  unFriendRequest
};
