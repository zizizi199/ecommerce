import multer from 'multer';
import express from 'express';
import { isAuth } from '../utils.mjs';
import cloudinary from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


const uploadRouter = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: fileFilter,
});

uploadRouter.post("/", isAuth, upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: "uploads_img",
      use_filename: true,
    });
    let img = result.secure_url;
    res.send(`${img}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "Something went wrong" });
  }
});



export default uploadRouter;
