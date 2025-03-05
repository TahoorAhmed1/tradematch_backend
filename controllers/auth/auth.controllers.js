const { prisma } = require("@/configs/prisma");
const { okResponse, unauthorizedResponse } = require("@/constants/responses");
const {
  hashPassword,

  createOtpToken,
  generateOTP,
  createToken,
} = require("@/services/auth.service");

const emailVerification = process.env.EMAIL_VERIFICATION;

const registerRealAccount = async (req, res, next) => {
  try {
    const { password, email, ...data } = req.body;

    let user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        userProfile: true,
        authentication: {
          select: {
            isEmailVerified: true,
          },
        },
      },
    });

    if (!user) {
      const hashedPassword = await hashPassword(password);
      const otp = generateOTP();
      user = await prisma.user.create({
        data: {
          ...data,
          email,
          password: hashedPassword,
        },
        include: {
          authentication: true,
        },
      });

      await prisma.authentication.create({
        data: {
          user_id: user?.id,
          emailOtp: otp,
        },
      });

      // await sendEmailVerificationOtp(email, otp);
      const verificationToken = createOtpToken({
        userId: user.id,
        type: emailVerification,
      });
      const response = okResponse(
        { token: verificationToken },
        "Otp has been sent on email."
      );
      return res.status(response.status.code).json(response);
    } else {
      const response = unauthorizedResponse("Email Already taken.");
      return res.status(response.status.code).json(response);
    }
  } catch (error) {
    next(error);
  }
};

const registerAsGuest = async (req, res, next) => {
  try {
    const user = await prisma.user.create({
      data: {
        type: "user",
        accountType: "guest",
      },
    });
    let toke_data = {
      userId: user.id,
      role: user.type,
      accountType: user.accountType,
    };
    const verificationToken = createToken(toke_data);

    const response = okResponse(
      { token: verificationToken, type: "user", accountType: "guest" },
      "Guest account created"
    );
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

const getUserDetail = async (req, res, next) => {
  const { userId } = req.user;
  try {
    const userDetail = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        user_onboarding_response: true,
        user_workouts: true,
      },
    });

    const response = okResponse(userDetail);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};
const getUser = async (req, res, next) => {
  try {
    const userDetail = await prisma.user.findMany({});

    const response = okResponse(userDetail);
    return res.status(response.status.code).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerRealAccount,
  registerAsGuest,
  getUserDetail,
  getUser,
};
