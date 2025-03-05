const { prisma } = require("@/configs/prisma");
const { createSuccessResponse } = require("@/constants/responses");

const createUserOnBoarding = async (req, res, next) => {
  const { userId } = req.user;
  const { onboardings } = req.body;
  try {
    const result = await prisma.user_onboarding_response.create({
      data: {
        user_id: Number(userId),
        user_onboarding_answers: {
          createMany: {
            data: onboardings?.map((answer) => ({
              answer_id: Number(answer?.answer_id),
              question_id: Number(answer?.question_id),
            })),
            skipDuplicates: true,
          },
        },
      },
    });

    const response = createSuccessResponse(result);
    return res.status(response?.status?.code).json(response);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createUserOnBoarding,
};
