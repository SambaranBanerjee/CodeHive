import { Router, Request, Response } from "express";
import {
  createFolderHandler,
  createProjectHandler,
  getProjectsForUserHandler,
} from "./projects.controller";
import { authMiddleware } from "../../middlewares/authMiddlewares";
import upload from "../../middlewares/upload"; // multer config
import fs from "fs";
import path from "path";

const router = Router();

// Create project
router.post("/", authMiddleware, createProjectHandler);

// Get user projects
router.get("/", authMiddleware, getProjectsForUserHandler);

// Create folder
router.post("/:projectId/folders", authMiddleware, createFolderHandler);

// Upload entire folder
router.post(
  "/:projectId/upload-folder",
  authMiddleware,
  upload.array("files"),
  (req: Request, res: Response) => {
    const { projectId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    console.log(`📂 Files uploaded for project ${projectId}:`, files.map(f => f.originalname));

    return res.status(200).json({
      message: "Files uploaded successfully!",
      count: files.length,
    });
  }
);

router.post("/:projectId/create-file", authMiddleware, (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { filePath, content } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: "filePath is required" });
  }

  const fullPath = path.join("uploads", projectId, filePath);

  try {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content || "", "utf-8");

    return res.status(200).json({ message: "File created successfully", filePath });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create file" });
  }
});



router.get("/:projectId/files", authMiddleware, (req: Request, res: Response) => {
  const { projectId } = req.params;

  // Project upload directory
  const projectDir = path.join("uploads", projectId);

  if (!fs.existsSync(projectDir)) {
    return res.json({ files: [] });
  }

  // Flatten files (no folders)
  const readFiles = (dir: string): any[] => {
    return fs.readdirSync(dir).flatMap((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        return readFiles(filePath); // go deeper but don't include folder itself
      } else {
        return {
          name: file, // ✅ only file name, no parent folder
          type: "file",
          size: stats.size,
          modified: stats.mtime,
        };
      }
    });
  };

  const files = readFiles(projectDir);
  res.json({ files });
});



export default router;
