"use client";

import { useState } from "react";
import Image from "next/image";
import compass from "@/assets/compass-1299559_640.png";
import { RocketLaunchIcon, UserGroupIcon, BellIcon, ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";

// New: Mock data for friends and requests
const mockFriends = [
  { id: 1, name: "Alice", avatar: "A" },
  { id: 2, name: "Bob", avatar: "B" },
  { id: 3, name: "Charlie", avatar: "C" },
];

const mockRequests = [
  { id: 4, name: "David", avatar: "D" },
  { id: 5, name: "Eve", avatar: "E" },
];


// =================================================================
// New: FriendsSidebar Component
// =================================================================
function FriendsSidebar() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [isFriendsSidebarOpen, setIsFriendsSidebarOpen] = useState(true);

  if (!isFriendsSidebarOpen) {
    return (
      <div className="fixed top-0 right-0 h-full flex items-center z-30">
        <button
          onClick={() => setIsFriendsSidebarOpen(true)}
          className="bg-[#181818] p-2 rounded-l-md border-l border-t border-b border-gray-700 hover:bg-gray-700"
          title="Open Friends"
        >
          <ChevronDoubleLeftIcon className="h-6 w-6 text-white transform rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#181818] w-64 border-l border-gray-700 h-screen">
      {/* Header with Tabs */}
      <div className="flex p-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 flex items-center justify-center p-2 rounded-md gap-x-2 ${activeTab === 'friends' ? 'bg-gray-700' : 'hover:bg-gray-900'}`}
        >
          <UserGroupIcon className="h-5 w-5" />
          <span>Friends</span>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 flex items-center justify-center p-2 rounded-md gap-x-2 ${activeTab === 'requests' ? 'bg-gray-700' : 'hover:bg-gray-900'}`}
        >
          <BellIcon className="h-5 w-5" />
          <span>Requests</span>
           {mockRequests.length > 0 && <span className="bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">{mockRequests.length}</span>}
        </button>
      </div>

       {/* Close Button */}
       <button
          onClick={() => setIsFriendsSidebarOpen(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-white"
          title="Close Friends"
        >
         <ChevronDoubleLeftIcon className="h-5 w-5" />
        </button>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'friends' ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-400">Friends ({mockFriends.length})</h3>
            {mockFriends.map(friend => (
              <div key={friend.id} className="flex items-center gap-x-3">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-sm">{friend.avatar}</div>
                <span>{friend.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
             <h3 className="font-semibold text-gray-400">Requests ({mockRequests.length})</h3>
            {mockRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between">
                 <div className="flex items-center gap-x-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-sm">{req.avatar}</div>
                    <span>{req.name}</span>
                </div>
                <div className="flex gap-x-2">
                    <button className="text-green-500 hover:text-green-400 text-xs">Accept</button>
                    <button className="text-red-500 hover:text-red-400 text-xs">Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// =================================================================
// Main Home Component (Updated)
// =================================================================
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleCreateProject = (name: string) => {
    if (!name.trim()) return;
    const newProjects = [...projects, name.trim()];
    setProjects(newProjects);
    setSelectedProject(name.trim());
    setIsModalOpen(false);
  };

  return (
    <div className="flex bg-[#101010] text-white min-h-screen">
      {/* Project Sidebar (Left) */}
      <div className="relative flex flex-col items-center bg-[#181818] shadow-lg border-r border-gray-700 w-20 overflow-hidden">
        <div className="flex flex-col items-center space-y-4 py-4 w-full">
          <button className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-green-500 hover:bg-gray-600 cursor-pointer" title="Discover">
            <Image src={compass} alt="Discover" width={24} height={24} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-green-500 hover:bg-gray-600 cursor-pointer" title="Create / Join">+</button>
        </div>
        <div className="flex flex-col space-y-4 w-full px-2 mt-4">
          {projects.map((project, idx) => (
            <div key={idx} onClick={() => setSelectedProject(project)} className={`flex items-center justify-center cursor-pointer p-2 rounded-md transition-colors duration-200 ${selectedProject === project ? 'bg-green-600' : 'hover:bg-gray-700'}`} title={project}>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-700">{project[0].toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content (Center) */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        {!selectedProject && projects.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-y-6">
            <RocketLaunchIcon className="h-24 w-24 text-gray-500" />
            <h1 className="text-3xl font-bold text-gray-200">Welcome to Your Workspace</h1>
            <p className="text-gray-400 max-w-md">Create your first project to start collaborating with your team.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-4 bg-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200">Create Your First Project</button>
          </div>
        ) : !selectedProject && projects.length > 0 ? (
          <h1 className="text-2xl font-semibold text-gray-300">Select a project from the sidebar to get started</h1>
        ) : (
          <div className="w-full h-full">
            <h1 className="text-4xl font-bold">Project: {selectedProject}</h1>
            <p className="text-gray-400 mt-2">This is where your project dashboard, tasks, and files will go.</p>
          </div>
        )}
      </main>

       {/* New: Friends Sidebar (Right) */}
       <FriendsSidebar />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#181818] p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Create / Join Group</h2>
            <div className="mb-4">
              <input type="text" placeholder="Enter Team Code" className="w-full px-3 py-2 rounded-md border border-gray-500 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <button className="mt-2 w-full bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700">Join Group</button>
            </div>
            <div className="mb-4">
              <input type="text" placeholder="Enter Project Name" className="w-full px-3 py-2 rounded-md border border-gray-500 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500" id="projectName"/>
              <button className="mt-2 w-full bg-green-600 px-4 py-2 rounded-md hover:bg-green-700" onClick={() => handleCreateProject((document.getElementById("projectName") as HTMLInputElement)?.value || "")}>Create Project</button>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="mt-2 text-gray-400 hover:text-white">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}