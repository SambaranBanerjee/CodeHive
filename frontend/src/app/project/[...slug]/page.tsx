/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef, useState, useEffect } from "react";
import React from "react";
import { HashtagIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { UploadIcon, FilePlus } from "lucide-react";

export default function ProjectFilePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  // ✅ unwrap params
  const { slug } = React.use(params);

  const [projectId, branchName, ...folderPathParts] = slug;
  const folderPath = folderPathParts.join("/");

  const project = { name: "CodeHive", owner: "YourName" };

  type FileItem = {
    name: string;
    type: string;
    size?: number;
    children?: FileItem[];
  };

  const [files, setFiles] = useState<FileItem[]>([]);
  const [readmeContent, setReadmeContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showFileForm, setShowFileForm] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");

  const fetchFiles = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/files`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    }
  };

  const renderFiles = (items: any[], level = 0) => {
    return items.map((item, index) => (
      <div key={index} style={{ paddingLeft: level * 16 }} className="py-1">
        {item.type === "folder" ? (
          <div className="font-semibold text-blue-400">
            📁 {item.name}
            {renderFiles(item.children || [], level + 1)}
          </div>
        ) : (
          <div className="text-gray-300 flex items-center gap-3">
            <CodeBracketIcon className="h-5 w-5" /> {item.name}{" "}
          </div>  
        )}
      </div>
    ));
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId, branchName, folderPath]);

  // Upload folder
  const handleUploadFolder = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    for (const file of Array.from(selectedFiles)) {
      formData.append("files", file, (file as File).webkitRelativePath || file.name);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No auth token found");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/upload-folder`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload folder");

      console.log("✅ Folder uploaded successfully!");
      fetchFiles();
    } catch (error) {
      console.error("Folder upload failed:", error);
    }

    e.target.value = "";
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // ✅ Create File
  const handleCreateFile = async () => {
    if (!newFileName) {
      alert("Please enter a file name");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/create-file`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filePath: folderPath ? `${folderPath}/${newFileName}` : newFileName,
            content: newFileContent || "",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create file");

      console.log("✅ File created!");
      setShowFileForm(false);
      setNewFileName("");
      setNewFileContent("");
      fetchFiles();
    } catch (error) {
      console.error("File creation failed:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#101010] text-white">
      {/* Top Bar */}
      <header className="flex items-center h-12 px-4 border-b border-gray-700 shadow-sm flex-shrink-0">
        <HashtagIcon className="h-6 w-6 text-gray-500" />
        <h3 className="font-semibold ml-2">
          {project.name} / {folderPath || branchName}
        </h3>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* File Actions */}
        <div className="flex justify-between items-center mb-4">
          <span className="bg-[#181818] text-sm font-medium px-3 py-1 rounded-full">
            {branchName}
          </span>

          <div className="flex items-center space-x-2">
            {/* Upload Folder */}
            <button
              className="flex items-center gap-x-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
              onClick={handleUploadButtonClick}
            >
              <UploadIcon className="h-4 w-4" />
              <span>Upload Folder</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadFolder}
              multiple
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              webkitdirectory="true"
              directory=""
              style={{ display: "none" }}
            />

            {/* ✅ Create File */}
            <button
              className="flex items-center gap-x-2 px-4 py-2 bg-blue-700 rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => setShowFileForm(!showFileForm)}
            >
              <FilePlus className="h-4 w-4" />
              <span>New File</span>
            </button>
          </div>
        </div>

        {/* Create File Form */}
        {showFileForm && (
          <div className="mb-4 p-4 bg-[#181818] border border-gray-700 rounded-lg">
            <input
              type="text"
              placeholder="File name (e.g. index.js)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full mb-2 p-2 rounded bg-gray-900 text-white border border-gray-700"
            />
            <textarea
              placeholder="File content..."
              value={newFileContent}
              onChange={(e) => setNewFileContent(e.target.value)}
              className="w-full mb-2 p-2 rounded bg-gray-900 text-white border border-gray-700"
              rows={6}
            />
            <button
              onClick={handleCreateFile}
              className="px-4 py-2 bg-green-700 rounded hover:bg-green-600"
            >
              Create
            </button>
          </div>
        )}

        {/* File List */}
        <div className="bg-[#181818] rounded-lg border border-gray-700 p-4">
          {files.length > 0 ? (
            renderFiles(files)
          ) : (
            <p className="text-gray-400">No files uploaded yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
