const { prisma } = require("@/configs/prisma");
const { okResponse, createSuccessResponse } = require("@/constants/responses");

const getAllOnboardingQuestions = async (req, res, next) => {
  try {
    const result = await prisma.onboarding_questions.findMany({
      include: {
        onboarding_answers: true,
      },
    });
    const response = okResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};

const createOnboardingQuestions = async (req, res, next) => {
  try {
    const result = await prisma.onboarding_questions.create({
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

const updateQuestion = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await prisma.onboarding_questions.update({
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

module.exports = { getAllOnboardingQuestions, createOnboardingQuestions,updateQuestion };
