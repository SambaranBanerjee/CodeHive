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


router.get("/:projectId/files", authMiddleware, (req: Request, res: Response) => {
  const { projectId } = req.params;

  // Project upload directory
  const projectDir = path.join("uploads", projectId);

  if (!fs.existsSync(projectDir)) {
    return res.json({ files: [] }); // No files uploaded yet
  }

  // Recursive helper to build file tree
  const readDir = (dir: string): any[] => {
    return fs.readdirSync(dir).map((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        return {
          name: file,
          type: "folder",
          children: readDir(filePath),
        };
      } else {
        return {
          name: file,
          type: "file",
          size: stats.size,
          modified: stats.mtime,
        };
      }
    });
  };

  const fileTree = readDir(projectDir);
  res.json({ files: fileTree });
});


export default router;
