const { prisma } = require("@/configs/prisma");
const { okResponse, createSuccessResponse } = require("@/constants/responses");

const getAllOnboardingAnswers = async (req, res, next) => {
  try {
    const result = await prisma.onboarding_answers.findMany({
      include: {
        onboarding_questions: true,
      },
    });
    const response = okResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};

const createOnboardingAnswers = async (req, res, next) => {
  try {
    const result = await prisma.onboarding_answers.create({
      data: {
        ...req.body,
      },
    });
    const response = createSuccessResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};

const updateAnswers = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await prisma.onboarding_answers.update({
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

module.exports = { getAllOnboardingAnswers, createOnboardingAnswers ,updateAnswers};
