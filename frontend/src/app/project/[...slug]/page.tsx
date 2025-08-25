// app/project/[...slug]/page.tsx

"use client";
import { use } from "react";
import { HashtagIcon } from "@heroicons/react/24/outline";

// This component will get the URL parameters as props
export default function ProjectFilePage({ params }: { params: Promise<{ slug: string[] }> }) {
  // The 'slug' will be an array of the URL parts, e.g., ['5', 'main', 'src']
  const [projectId, branchName, ...folderPathParts] = use(params).slug;
  const folderPath = folderPathParts.join('/');

  // In a real app, you would use these IDs to fetch the folder's
  // content (list of files, etc.) from your backend.

  return (
    <div className="flex-1 flex flex-col bg-[#101010] text-white">
      {/* Top Bar */}
      <header className="flex items-center h-12 px-4 border-b border-gray-700 shadow-sm flex-shrink-0">
        <HashtagIcon className="h-6 w-6 text-gray-500" />
        <h3 className="font-semibold ml-2">
          {/* Display the current folder path */}
          {folderPath || branchName}
        </h3>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Content for: {folderPath || branchName}</h1>
        <p className="text-gray-400 mt-2">
          Project ID: {projectId}
        </p>
        <div className="mt-8 p-4 bg-[#181818] rounded-md border border-gray-700">
          {/* This is where you would render the Monaco code editor or a list of files */}
          <p>File list or code editor will go here...</p>
        </div>
      </main>
    </div>
  );
}