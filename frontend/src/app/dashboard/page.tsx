"use client";

import { useState } from "react";
import Image from "next/image";
import compass from "../assets/compass-1299559_640.png";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);

  // Handles creation/joining of new project (mock for now)
  const handleCreateProject = (name: string) => {
    setProjects([...projects, name]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex bg-[#101010] text-white min-h-screen pt-16">
      {/* Sidebar */}
      <div className="group relative flex flex-col items-center bg-[#181818] mt-2 shadow-lg border-r border-gray-700 
                      w-20 hover:w-64 transition-all duration-300 ease-in-out overflow-hidden">
        
        {/* Compass + Add buttons at top */}
        <div className="flex flex-col items-center space-y-4 py-4 w-full">
          {/* Compass Button */}
          <button
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-green-500 hover:bg-gray-600 cursor-pointer"
            title="Discover"
          >
            <Image src={compass} alt="Discover" width={24} height={24} />
          </button>

          {/* + Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-green-500 hover:bg-gray-600 cursor-pointer"
            title="Create / Join"
          >
            +
          </button>
        </div>

        {/* Project list */}
        <div className="flex flex-col space-y-4 w-full px-2 mt-4">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-700"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700">
                {project[0].toUpperCase()}
              </div>
              {/* Visible only when sidebar expanded */}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {project}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <h1 className="text-2xl font-semibold text-gray-300">
          Select or create a project to get started
        </h1>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#181818] p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create / Join Group</h2>

            {/* Join Group */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter Team Code"
                className="w-full px-3 py-2 rounded-md border border-gray-500 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="mt-2 w-full bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700">
                Join Group
              </button>
            </div>

            {/* Create Group */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter Project Name"
                className="w-full px-3 py-2 rounded-md border border-gray-500 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                id="projectName"
              />
              <button
                className="mt-2 w-full bg-green-600 px-4 py-2 rounded-md hover:bg-green-700"
                onClick={() =>
                  handleCreateProject(
                    (document.getElementById("projectName") as HTMLInputElement)
                      ?.value || "New Project"
                  )
                }
              >
                Create Project
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
