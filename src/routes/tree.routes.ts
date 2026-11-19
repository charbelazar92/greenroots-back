import { Router } from "express";
import  multer from "multer";

import { treeController } from "../controllers/tree.controller.js";
import { verifyAuth, verifyAdmin } from "../middlewares/auth.middleware.ts";
import { handleUploadError } from "../middlewares/handleUploadError.ts";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return callback(new Error("Type de fichier non autorisé. Seuls JPEG, PNG et WEBP sont acceptés."));
    }
    callback(null, true);
  },
});

const router = Router();

router.get("/", treeController.getAllTrees);
router.get("/:slug", treeController.getTreeBySlug);
router.post("/", verifyAuth, verifyAdmin,upload.single("image"), handleUploadError,treeController.createTree);
router.patch("/:slug", verifyAuth, verifyAdmin, upload.single("image"), handleUploadError,treeController.updateTree);
router.delete("/:slug", verifyAuth,verifyAdmin,treeController.deleteTree);

export default router;