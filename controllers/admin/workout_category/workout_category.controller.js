const { prisma } = require("@/configs/prisma");
const { okResponse, createSuccessResponse } = require("@/constants/responses");

const getAllWorkouts = async (req, res, next) => {
  try {
    const result = await prisma.workout_category.findMany({
      include: {
        workout_subcategory: {
          include: {
            workout_subcategory_category: true,
          },
        },
      },
    });
    const response = okResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};

const createWorkout = async (req, res, next) => {
  try {
    const result = await prisma.workout_category.create({
      data: { ...req.body },
    });
    const response = createSuccessResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};

const updateWorkout = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await prisma.workout_category.update({
      where: {
        id: Number(id),
      },
      data: { ...req.body },
    });
    const response = createSuccessResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllWorkouts, createWorkout, updateWorkout };
