const { prisma } = require("../../../configs/prisma");
const {
  badRequestResponse,
  createSuccessResponse,
  updateSuccessResponse,
} = require("../../../constants/responses");

const sendConnection = async (req, res, next) => {
  const { userId } = req.user;
  const { receiver_id } = req.body;

  try {
    if (receiver_id === userId) {
      return res
        .status(400)
        .json(badRequestResponse("You cannot connect with yourself."));
    }

    const existing = await prisma.connection.findFirst({
      where: {
        sender_id: userId,
        receiver_id,
        is_deleted: false,
      },
    });

    if (existing) {
      return res
        .status(400)
        .json(badRequestResponse("Connection request already sent."));
    }

    const connection = await prisma.connection.create({
      data: {
        sender_id: userId,
        receiver_id,
        status: "PENDING",
      },
    });

    const response = createSuccessResponse(
      connection,
      "Connection request sent."
    );
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const acceptConnection = async (req, res, next) => {
  const { userId } = req.user;
  const { connection_id } = req.params;

  try {
    const connection = await prisma.connection.findUnique({
      where: { id: connection_id },
    });

    if (!connection || connection.is_deleted) {
      return res.status(404).json(notFoundResponse("Connection not found."));
    }

    if (connection.receiver_id !== userId) {
      return res
        .status(403)
        .json(
          badRequestResponse(
            "You are not authorized to accept this connection."
          )
        );
    }

    if (connection.status === "ACCEPTED") {
      return res
        .status(400)
        .json(badRequestResponse("Connection already accepted."));
    }

    const updated = await prisma.connection.update({
      where: { id: connection_id },
      data: {
        status: "ACCEPTED",
      },
    });

    return res
      .status(200)
      .json(
        updateSuccessResponse(updated, "Connection accepted successfully.")
      );
  } catch (error) {
    next(error);
  }
};

const getAllPendingConnection = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const connection = await prisma.connection.findMany({
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

    return res
      .status(200)
      .json(
        updateSuccessResponse(connection, "Connection accepted successfully.")
      );
  } catch (error) {
    next(error);
  }
};

const getAllConfirmConnection = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const connections = await prisma.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ sender_id: userId }, { receiver_id: userId }],
      },
      include: {
        sender: {
          include: { profile: true },
        },
        receiver: {
          include: { profile: true },
        },
      },
    });

    return res
      .status(200)
      .json(
        updateSuccessResponse(
          connections,
          "All confirmed connections fetched successfully."
        )
      );
  } catch (error) {
    next(error);
  }
};

const toggleBlockConnection = async (req, res, next) => {
  const { userId } = req.user;
  const { connection_id } = req.params;
  const { block } = req.body;

  try {
    const connection = await prisma.connection.findUnique({
      where: { id: connection_id },
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

    const updated = await prisma.connection.update({
      where: { id: connection_id },
      data: {
        is_block: block,
      },
    });

    const message = block ? "Connection blocked." : "Connection unblocked.";
    return res.status(200).json(updateSuccessResponse(updated, message));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendConnection,
  acceptConnection,
  toggleBlockConnection,
  getAllPendingConnection,
  getAllConfirmConnection,
};
