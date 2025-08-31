import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = "uploads";

// Ensure base upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const projectId = req.params.projectId; // take projectId from route
    const relativePath = (file as any).originalname; // frontend sends webkitRelativePath
    const folderPath = path.join(uploadDir, projectId, path.dirname(relativePath));

    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname)); // keep original filename
  },
});

const upload = multer({ storage });

export default upload;
