const { prisma } = require("@/configs/prisma");
const { okResponse, createSuccessResponse } = require("@/constants/responses");

const getAllSubCategoryCategoryWorkouts = async (req, res, next) => {
  try {
    const result = await prisma.workout_subcategory_category.findMany({
      include: { workout_subcategory: true },
    });
    const response = okResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};

const createSubCategoryCategoryWorkout = async (req, res, next) => {
  try {
    const result = await prisma.workout_subcategory_category.create({
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
    const result = await prisma.workout_subcategory_category.update({
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

module.exports = {
  getAllSubCategoryCategoryWorkouts,
  createSubCategoryCategoryWorkout,
};
