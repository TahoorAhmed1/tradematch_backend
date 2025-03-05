const cloudinary = require("@/configs/cloudinary");
const { okResponse } = require("../constants/responses");
const { logger } = require("../configs/logger");

const uploadImage = async (req, res, next) => {
  const file = req.files[0];
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${b64}`;

  try {
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: `assets/${file.fieldname}`,
      public_id: `${file.originalname.split(".")[0]}-${Date.now()}`,
    });
    const imageUrl = result.secure_url;
    const response = okResponse(imageUrl);
    return res.status(response.status.code).json(response);
  } catch (error) {
    logger.error("Error uploading image to Cloudinary.", error);
    return next(error);
  }
};

module.exports = uploadImage;
