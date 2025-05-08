// controllers/client/messaging/messagingController.js
const { pusher } = require("../../../configs/pusher");
const { prisma } = require("../../../configs/prisma");
const {
    badRequestResponse,
    createSuccessResponse,
    okResponse,
} = require("../../../constants/responses");
const { uploadVideoFromBuffer, uploadImageFromBuffer, uploadDocumentFromBuffer } = require("../../../middlewares/uploadPicture.middleware");

async function ensureCanChat1to1(userA, userB) {
    const conn = await prisma.connection.findFirst({
        where: {
            OR: [
                { sender_id: userA, receiver_id: userB },
                { sender_id: userB, receiver_id: userA },
            ],
            status: "ACCEPTED",
            is_deleted: false,
        },
    });
    if (!conn) throw { status: 403, message: "You are not connected." };

    const block = await prisma.block.findUnique({
        where: {
            blocker_id_blocked_id: { blocker_id: userA, blocked_id: userB },
        },
    });
    if (block) throw { status: 403, message: "You have blocked this user." };

    const blockedBy = await prisma.block.findUnique({
        where: {
            blocker_id_blocked_id: { blocker_id: userB, blocked_id: userA },
        },
    });
    if (blockedBy) throw { status: 403, message: "You are blocked by this user." };

    return conn;
}

const create1to1 = async (req, res, next) => {
    const userId = req.user.userId;
    const { recipientId } = req.body;
    if (recipientId === userId) {
        return res.status(400).json(badRequestResponse("Cannot chat with yourself."));
    }
    try {
        await ensureCanChat1to1(userId, recipientId);

        let conv = await prisma.conversation.findFirst({
            where: {
                is_group: false,
                members: {
                    every: {
                        OR: [{ user_id: userId }, { user_id: recipientId }],
                    },
                },
            },
        });

        if (!conv) {
            conv = await prisma.conversation.create({
                data: {
                    is_group: false,
                    members: {
                        create: [
                            { user_id: userId, role: "MEMBER" },
                            { user_id: recipientId, role: "MEMBER" },
                        ],
                    },
                },
            });
        }

        res.json(okResponse(conv));
    } catch (err) {
        if (err.status) return res.status(err.status).json(badRequestResponse(err.message));
        next(err);
    }
};

const createGroup = async (req, res, next) => {
    const userId = req.user.userId;
    const { name, memberIds } = req.body;

    try {


        const conv = await prisma.conversation.create({
            data: {
                name,
                is_group: true,
                members: {
                    create: [
                        { user_id: userId, role: "ADMIN" },
                        ...memberIds.map((id) => ({ user_id: id, role: "MEMBER" })),
                    ],
                },
            },

        });

        res.json(okResponse(conv));
    } catch (err) {
        next(err);
    }
};


const listConversations = async (req, res, next) => {
    const userId = req.user.userId;
    try {
        const memberships = await prisma.conversation_member.findMany({
            where: { user_id: userId },
            include: {
                conversation: {
                    include: {
                        members: { include: { user: { include: { profile: true } } } },
                        messages: { orderBy: { created_at: "desc" }, take: 1 },
                    },
                },
            },
        });

        const data = memberships.map((m) => {
            const c = m.conversation;
            console.log('c', c)
            let participant;
            if (!c.is_group) {
                const other = c.members.find((x) => x.user_id !== userId).user;
                participant = {
                    id: other.id,
                    name: `${other?.profile?.first_name} ${other.profile.last_name}`,
                    avatar: other.profile.profile_picture_url,
                    is_online: other.is_online,
                };
            } else {
                const other = c.members.find((x) => x.role == "ADMIN").user;
                participant = {
                    id: c?.id,
                    name: `${c?.name}`,
                    avatar: other?.profile?.profile_picture_url,
                    is_online: other?.is_online,
                };
            }
            return {
                conversationId: c.id,
                isGroup: c.is_group,
                participant,
                lastMessage: c.messages[0] || null,
            };
        });

        res.json(okResponse(data));
    } catch (err) {
        next(err);
    }
};

const getMessages = async (req, res, next) => {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    try {
        const member = await prisma.conversation_member.findFirst({
            where: { conversation_id: conversationId, user_id: userId },
        });
        if (!member) {
            return res.status(403).json(badRequestResponse("Not in this conversation."));
        }

        const conv = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { members: true },
        });
        if (!conv.is_group) {
            const otherId = conv.members.find((m) => m.user_id !== userId).user_id;
            await ensureCanChat1to1(userId, otherId);
        }

        const messages = await prisma.message.findMany({
            where: { conversation_id: conversationId, is_deleted: false },
            orderBy: { created_at: "asc" },
            include: {
                sender: { include: { profile: true } },
                attachments: true,
            },
        });


        res.json(okResponse(messages));
    } catch (err) {
        next(err);
    }
};

const sendMessage = async (req, res, next) => {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { content } = req.body;

    let attachment = null;
    const file = req?.files?.[0];

    try {
        const member = await prisma.conversation_member.findFirst({
            where: { conversation_id: conversationId, user_id: userId },
        });
        if (!member) {
            return res.status(403).json(badRequestResponse("Not in this conversation."));
        }

        const conv = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { members: true },
        });
        if (!conv.is_group) {
            const otherId = conv.members.find((m) => m.user_id !== userId).user_id;
            await ensureCanChat1to1(userId, otherId);
        }

        if (file) {
            let url;
            let fileType = "";

            if (file.mimetype.startsWith("image/")) {
                url = await uploadImageFromBuffer(file);
                fileType = "IMAGE";
            } else if (file.mimetype.startsWith("video/")) {
                url = await uploadVideoFromBuffer(file);
                fileType = "VIDEO";
            } else if (file.mimetype === "application/pdf") {
                url = await uploadDocumentFromBuffer(file);
                fileType = "PDF";
            } else if (["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"].includes(file.mimetype)) {
                url = await uploadDocumentFromBuffer(file);
                fileType = "SPREADSHEET";
            } else {
                return res.status(400).json(badRequestResponse("Unsupported file type."));
            }

            attachment = await prisma.file.create({
                data: {
                    url,
                    type: fileType,
                    filename: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                },
            });
        }

        const message = await prisma.message.create({
            data: {
                conversation_id: conversationId,
                sender_id: userId,
                content,
                attachments: attachment
                    ? {
                        connect: { id: attachment.id },
                    }
                    : undefined,
            },
            include: { sender: { include: { profile: true } }, attachments: true },
        });

        await pusher.trigger(`conversation-${conversationId}`, "message:new", message);
        res.json(createSuccessResponse(message, "Message sent."));
    } catch (err) {
        next(err);
    }
};


const updateGroup = async (req, res, next) => {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { name, addMemberIds, removeMemberIds } = req.body;

    try {
        const conv = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { members: true },
        });
        if (!conv || !conv.is_group) {
            return res.status(404).json(badRequestResponse("Group not found."));
        }

        // only ADMIN can update
        const yourMembership = conv.members.find((m) => m.user_id === userId);
        if (!yourMembership || yourMembership.role !== "ADMIN") {
            return res.status(403).json(badRequestResponse("Not an admin."));
        }

        const data = {};
        if (name) data.name = name;
        if (addMemberIds) {
            data.members = {
                create: addMemberIds.map((id) => ({ user_id: id, role: "MEMBER" })),
            };
        }
        if (removeMemberIds) {
            data.members = {
                deleteMany: removeMemberIds.map((id) => ({
                    user_id: id,
                })),
            };
        }

        const updated = await prisma.conversation.update({
            where: { id: conversationId },
            data,
            include: { members: { include: { user: { include: { profile: true } } } } },
        });

        res.json(createSuccessResponse(updated, "Group updated."));
    } catch (err) {
        next(err);
    }
};

const typingNotification = async (req, res, next) => {
    const { userId } = req.user;
    const { conversationId } = req.params;
    const { typing } = req.body;

    try {
        pusher.trigger(
            `conversation-${conversationId}`,
            'user:typing',
            { typing, userId }
        );

        return res.status(200).send({ message: "Typing notification sent" });
    } catch (err) {
        next(err);
    }
};


module.exports = {
    create1to1,
    createGroup,
    listConversations,
    getMessages,
    sendMessage,
    updateGroup,
    typingNotification
}
