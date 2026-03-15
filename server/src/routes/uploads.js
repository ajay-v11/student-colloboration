import express from "express";
import authMiddleware from "../middleware/auth.js";
import { createUpload, createChannelUpload } from "../middleware/upload.js";

const router = express.Router();

const profileUpload = createUpload("profiles");

// POST /api/uploads/profile - Upload a profile image
router.post(
  "/profile",
  authMiddleware,
  (req, res, next) => {
    profileUpload.single("image")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size must be under 4MB" });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const url = `/media/profiles/${req.file.filename}`;
    res.json({ url });
  }
);

const channelUpload = createChannelUpload("channels");

// POST /api/uploads/channel - Upload a channel file
router.post(
  "/channel",
  authMiddleware,
  (req, res, next) => {
    channelUpload.single("file")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size must be under 10MB" });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const url = `/media/channels/${req.file.filename}`;
    res.json({
      url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    });
  }
);

const resourceUpload = createChannelUpload("resources");

// POST /api/uploads/resource - Upload a resource file
router.post(
  "/resource",
  authMiddleware,
  (req, res, next) => {
    resourceUpload.single("file")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size must be under 10MB" });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const url = `/media/resources/${req.file.filename}`;
    res.json({
      url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    });
  }
);

export default router;
