const { prisma } = require("@/configs/prisma");
const { okResponse, createSuccessResponse } = require("@/constants/responses");

const getAllSubCategoryWorkouts = async (req, res, next) => {
  try {
    const result = await prisma.workout_subcategory.findMany({
      include: { workout_subcategory_category: true, workout_category: true },
    });
    const response = okResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};

const createSubCategoryWorkout = async (req, res, next) => {
  try {
    const result = await prisma.workout_subcategory.create({
      data: { ...req.body },
    });
    const response = createSuccessResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};

const updateSubCategoryWorkout = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await prisma.workout_subcategory.update({
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

module.exports = { getAllSubCategoryWorkouts, createSubCategoryWorkout,updateSubCategoryWorkout };
