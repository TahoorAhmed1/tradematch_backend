const { prisma } = require("../../../configs/prisma");
const { okResponse, badRequestResponse } = require("../../../constants/responses");


const getAllNotifications = async (req, res, next) => {
    const { userId } = req.user;

    try {
        const notifications = await prisma.notification.findMany({
            where: { user_id: userId, is_read: false },
            orderBy: { created_at: "desc" },
        });

        res.status(200).json(okResponse(notifications));
    } catch (error) {
        next(error);
    }
};

const markNotificationAsReadAndDelete = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json(badRequestResponse("Notification ID is required."));
    }

    try {
        await prisma.notification.update({
            where: { id: id },
            data: { is_read: true },
        });

        await prisma.notification.delete({
            where: { id: id },
        });

        res.status(200).json(okResponse(null, "Notification marked as read and deleted."));
    } catch (error) {
        next(error);
    }
};

const markAllNotificationsAsReadAndDelete = async (req, res, next) => {
    const { userId } = req.user;

    try {
        const updated = await prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true },
        });

        await prisma.notification.deleteMany({
            where: { user_id: userId, is_read: true },
        });

        res.status(200).json(okResponse(updated, "All notifications marked as read and deleted."));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllNotifications,
    markNotificationAsReadAndDelete,
    markAllNotificationsAsReadAndDelete,
};
