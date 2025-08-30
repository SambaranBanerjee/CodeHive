"use client";
import { use } from "react";
import { HashtagIcon, PlusIcon, CodeBracketIcon, PlayIcon, FolderIcon } from "@heroicons/react/24/outline";

// This component will get the URL parameters as props
export default function ProjectFilePage({ params }: { params: Promise<{ slug: string[] }> }) {
  // The 'slug' will be an array of the URL parts, e.g., ['5', 'main', 'src']
  const [projectId, branchName, ...folderPathParts] = use(params).slug;
  const folderPath = folderPathParts.join('/');
  
  // In a real app, you would fetch these from an API
  const project = { name: "CodeHive", owner: "YourName" };
  const files = [
    { name: "README.md", lastCommit: "Initial commit", age: "3 weeks ago", icon: <CodeBracketIcon className="h-4 w-4 text-gray-400" /> },
    { name: ".vscode", lastCommit: "Added settings", age: "last week", icon: <FolderIcon className="h-4 w-4 text-gray-400" /> },
    { name: "backend", lastCommit: "Fixed auth bug", age: "5 days ago", icon: <FolderIcon className="h-4 w-4 text-gray-400" /> },
    { name: "frontend", lastCommit: "Design updates", age: "2 days ago", icon: <FolderIcon className="h-4 w-4 text-gray-400" /> },
  ];

  const hasReadme = files.some(file => file.name === 'README.md');
  const readmeContent = `# CodeHive Project
  
  Welcome to your project's home page!
  
  This is your central hub for code collaboration and file management. You can use the buttons above to **create new files** or **upload existing ones** from your local system.
  
  ### Getting Started
  
  1.  **Create a Folder:** Organize your code into logical directories.
  2.  **Invite Collaborators:** Share this project with your team to start working together.
  3.  **Start Coding:** Dive into your files and build something amazing!
  `;

  return (
    <div className="flex-1 flex flex-col bg-[#101010] text-white">
      {/* Top Bar */}
      <header className="flex items-center h-12 px-4 border-b border-gray-700 shadow-sm flex-shrink-0">
        <HashtagIcon className="h-6 w-6 text-gray-500" />
        <h3 className="font-semibold ml-2">
          {/* Display the current folder path */}
          {project.name} / {folderPath || branchName}
        </h3>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* File Actions Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="bg-[#181818] text-sm font-medium px-3 py-1 rounded-full">{branchName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center gap-x-2 px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors">
              <PlusIcon className="h-4 w-4" />
              <span>Create File</span>
            </button>
            <button className="flex items-center gap-x-2 px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
              <PlayIcon className="h-4 w-4" />
              <span>Upload File</span>
            </button>
          </div>
        </div>

        {/* File List/Content */}
        <div className="bg-[#181818] rounded-lg border border-gray-700 overflow-hidden">
          {/* File Header Row */}
          <div className="flex items-center px-4 py-2 border-b border-gray-700 font-semibold text-gray-400">
            <div className="flex-1">Name</div>
            <div className="w-1/3">Last commit</div>
            <div className="w-1/6 text-right">Age</div>
          </div>
          {/* File List */}
          {files.map((file, index) => (
            <div key={index} className="flex items-center px-4 py-2 hover:bg-gray-700/50 transition-colors">
              <div className="flex-1 flex items-center space-x-2">
                {file.icon}
                <span>{file.name}</span>
              </div>
              <div className="w-1/3 text-sm text-gray-400 truncate">
                {file.lastCommit}
              </div>
              <div className="w-1/6 text-sm text-gray-400 text-right">
                {file.age}
              </div>
            </div>
          ))}
        </div>
        
        {/* README.md Section */}
        <div className="mt-6 p-6 bg-[#181818] rounded-lg border border-gray-700 min-h-[200px] overflow-x-auto no-scrollbar">
          {hasReadme ? (
            <div>
              <h2 className="text-xl font-bold mb-4">README.md</h2>
              <div className="prose prose-invert max-w-none text-gray-300 break-words">
                <pre><code>{readmeContent}</code></pre>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 mb-4">No README.md found in this folder.</p>
              <button className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Add README.md
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
