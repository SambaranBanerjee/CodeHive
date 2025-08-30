"use client";

import { useState,useEffect } from "react";
import Image from "next/image";
import compass from "@/assets/compass-1299559_640.png";
import {
  RocketLaunchIcon, UserGroupIcon, BellIcon, ChevronDoubleLeftIcon, HashtagIcon, VideoCameraIcon, PlusIcon, FolderIcon, HomeIcon, UserPlusIcon, PaperAirplaneIcon, Cog6ToothIcon, CodeBracketIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
// We need to import the new API functions
import { getProjects, createProject, createFolder } from "@/api/api";
// To simulate navigation, we'd use this hook from Next.js
// import { useRouter } from 'next/navigation';

type TextOrVideoChannel = { id: string; name: string; };
type Project = {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  mainCodeFolders: string[];
  branchCodeFolders: string[];
  textChannels: TextOrVideoChannel[];
  videoChannels: TextOrVideoChannel[];
};
type Friend = { id: number; name: string; avatar: string; };
type FriendRequest = { id: number; name: string; avatar: string; };

function FriendsSidebar() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [isFriendsSidebarOpen, setIsFriendsSidebarOpen] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  if (!isFriendsSidebarOpen) {
    return (
      <div className="fixed top-0 right-0 h-full flex items-center z-30">
        <button onClick={() => setIsFriendsSidebarOpen(true)} className="bg-[#181818] p-2 rounded-l-md border-l border-t border-b border-gray-700 hover:bg-gray-700" title="Open Friends">
          <ChevronDoubleLeftIcon className="h-6 w-6 text-white transform rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#181818] w-64 border-l border-gray-700 h-screen">
      <div className="flex p-2 border-b border-gray-700">
        <button onClick={() => setActiveTab('friends')} className={`flex-1 flex items-center justify-center p-2 rounded-md gap-x-2 ${activeTab === 'friends' ? 'bg-gray-700' : 'hover:bg-gray-900'}`}><UserGroupIcon className="h-5 w-5" /><span>Friends</span></button>
        <button onClick={() => setActiveTab('requests')} className={`flex-1 flex items-center justify-center p-2 rounded-md gap-x-2 ${activeTab === 'requests' ? 'bg-gray-700' : 'hover:bg-gray-900'}`}><BellIcon className="h-5 w-5" /><span>Requests</span>{requests.length > 0 && <span className="bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center">{requests.length}</span>}</button>
      </div>
      <button onClick={() => setIsFriendsSidebarOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-white" title="Close Friends"><ChevronDoubleLeftIcon className="h-5 w-5" /></button>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'friends' ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-400">Friends ({friends.length})</h3>
            {friends.length === 0 ? (<p className="text-center text-sm text-gray-500 pt-4">Your friends list is empty.</p>) : (friends.map(friend => (<div key={friend.id} className="flex items-center gap-x-3"><div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-sm">{friend.avatar}</div><span>{friend.name}</span></div>)))}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-400">Requests ({requests.length})</h3>
            {requests.length === 0 ? (<p className="text-center text-sm text-gray-500 pt-4">You have no pending requests.</p>) : (requests.map(req => (<div key={req.id} className="flex items-center justify-between"><div className="flex items-center gap-x-3"><div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-500 text-sm">{req.avatar}</div><span>{req.name}</span></div><div className="flex gap-x-2"><button className="text-green-500 hover:text-green-400 text-xs">Accept</button><button className="text-red-500 hover:text-red-400 text-xs">Decline</button></div></div>)))}
          </div>
        )}
      </div>
    </div>
  );
}

function InitialProjectModal({ onClose, onNavigateToCreate }: { onClose: () => void; onNavigateToCreate: () => void; }) {
    return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#181818] p-6 rounded-lg shadow-lg w-96 text-white" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center mb-2">Create or Join a Project</h2>
        <p className="text-center text-gray-400 mb-6">Join a friend&apos;s project with a code or create a brand new one.</p>
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-300 mb-2 block">JOIN WITH A CODE</label>
          <div className="flex gap-x-2">
            <input type="text" placeholder="Enter project code" className="flex-1 w-full px-3 py-2 rounded-md border border-gray-700 bg-[#101010] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <button className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Join</button>
          </div>
        </div>
        <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-700"></div>
        </div>
        <div>
          <button onClick={onNavigateToCreate} className="w-full bg-green-600 p-3 rounded-md hover:bg-green-700 transition-colors font-semibold">
            Create Your Own Project
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: (projectData: Omit<Project, 'id' | 'mainCodeFolders' | 'branchCodeFolders' | 'textChannels' | 'videoChannels'>) => void; }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name, description, isPrivate });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#181818] p-6 rounded-lg shadow-lg w-[480px] text-white">
        <h2 className="text-2xl font-bold text-center mb-4">Create a New Project</h2>
        <p className="text-center text-gray-400 mb-6">Give your new project a personality with a name and description.</p>
        <div className="space-y-4">
          <div><label className="text-sm font-semibold text-gray-300 mb-2 block">PROJECT NAME</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AI Chatbot" className="w-full px-3 py-2 rounded-md border border-gray-700 bg-[#101010] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="text-sm font-semibold text-gray-300 mb-2 block">DESCRIPTION</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" rows={3} className="w-full px-3 py-2 rounded-md border border-gray-700 bg-[#101010] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"></textarea></div>
          <div className="flex items-center justify-between bg-[#101010] p-3 rounded-md border border-gray-700">
            <div><h4 className="font-semibold">Private Project</h4><p className="text-sm text-gray-400">Only invited members can see and join.</p></div>
            <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div></label>
          </div>
        </div>
        <div className="mt-6 flex justify-between items-center bg-[#101010] p-3 rounded-md">
            <button onClick={onClose} className="text-gray-400 hover:text-white">Cancel</button>
            <button onClick={handleCreate} className="bg-green-600 px-6 py-2 rounded-md hover:bg-green-700 transition-colors">Create</button>
        </div>
      </div>
    </div>
  );
}

function CreateFolderModal({
  onClose,
  onCreate,
  targetType
}: {
  onClose: () => void;
  onCreate: (folderName: string) => void;
  targetType: 'Main' | 'Branch';
}) {
  const [folderName, setFolderName] = useState('');

  const handleCreate = () => {
    if (!folderName.trim()) return;
    onCreate(folderName.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#181818] p-6 rounded-lg shadow-lg w-96 text-white">
        <h2 className="text-xl font-bold mb-4">Create New {targetType} Folder</h2>
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">FOLDER NAME</label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g. feature-new-login"
            className="w-full px-3 py-2 rounded-md border border-gray-700 bg-[#101010] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="mt-6 flex justify-end items-center gap-x-3">
          <button onClick={onClose} className="text-gray-400 hover:text-white px-4 py-2 rounded-md hover:bg-gray-700">Cancel</button>
          <button onClick={handleCreate} className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-700 transition-colors">Create Folder</button>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// ProjectChannelList Component (Updated & Safer)
// =================================================================
function ProjectChannelList({
  project,
  onAddFolder,
  activeFolderPath,
  setActiveFolderPath
}: {
  project: Project;
  onAddFolder: (target: 'main' | 'branch') => void;
  activeFolderPath: string | null;
  setActiveFolderPath: (path: string) => void;
}) {
  const [openCategories, setOpenCategories] = useState({ main: true, branch: true, text: true, video: true });

  const toggleCategory = (category: 'main' | 'branch' | 'text' | 'video') => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const FolderLink = ({ name, branchName }: { name: string, branchName: string }) => {
    // Construct a unique path for the folder to track its active state
    const folderPath = `${branchName}/${name}`;
    const isActive = activeFolderPath === folderPath;

    return (
      <Link
        href={`/project/${project.id}/${branchName}/${name}`}
        passHref
      >
        <div
          onClick={() => setActiveFolderPath(folderPath)}
          className={`flex items-center gap-x-2 text-gray-400 p-2 rounded-md cursor-pointer
                    ${isActive ? 'bg-green-600/50 text-white' : 'hover:text-white hover:bg-gray-700/50'}`}
        >
          <FolderIcon className="h-5 w-5" />
          <span>{name}</span>
        </div>
      </Link>
    );
  };

  const ChannelLink = ({ channel, type }: { channel: TextOrVideoChannel, type: 'text' | 'video' }) => {
    const Icon = type === 'text' ? HashtagIcon : VideoCameraIcon;
    return (
      <a href="#" className="flex items-center gap-x-2 text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-md">
        <Icon className="h-5 w-5" />
        <span>{channel.name}</span>
      </a>
    );
  };

  return (
    <div className="w-60 bg-[#141414] flex-shrink-0 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700 shadow-md">
        <h2 className="font-bold text-lg truncate">{project.name}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* PROJECT CODE (MAIN) */}
        <div>
          <button onClick={() => toggleCategory('main')} className="flex items-center justify-between w-full text-sm text-gray-400 hover:text-white font-semibold">
            <span>PROJECT CODE (MAIN)</span>
            <div onClick={(e) => {e.stopPropagation(); onAddFolder('main');}} className="hover:bg-gray-600 rounded p-0.5"><PlusIcon className="h-4 w-4" /></div>
          </button>
          {openCategories.main && (
            <div className="mt-2 space-y-1 pl-2">
              {(project.mainCodeFolders || []).map(name => <FolderLink key={name} name={name} branchName="main"/>)}
            </div>
          )}
        </div>
        {/* PROJECT CODE (BRANCHES) */}
        <div>
          <button onClick={() => toggleCategory('branch')} className="flex items-center justify-between w-full text-sm text-gray-400 hover:text-white font-semibold">
            <span>PROJECT CODE (BRANCHES)</span>
            <div
            onClick={
              (e) => {e.stopPropagation(); onAddFolder('branch');
            }}
            className="hover:bg-gray-600 rounded p-0.5"
            >
              <PlusIcon className="h-4 w-4" />
            </div>
          </button>
          {openCategories.branch && (
            <div className="mt-2 space-y-1 pl-2">
              {(project.branchCodeFolders || []).map(name => <FolderLink key={name} name={name} branchName={name}/>)}
            </div>
          )}
        </div>
        {/* TEXT CHATS */}
        <div>
          <button onClick={() => toggleCategory('text')} className="flex items-center justify-between w-full text-sm text-gray-400 hover:text-white font-semibold">
            <span>TEXT CHATS</span>
            <div className="hover:bg-gray-600 rounded p-0.5"><PlusIcon className="h-4 w-4" /></div>
          </button>
          {openCategories.text && (
            <div className="mt-2 space-y-1 pl-2">
              {(project.textChannels || []).map(c => <ChannelLink key={c.id} channel={c} type="text"/>)}
            </div>
          )}
        </div>
        {/* VIDEO SESSIONS */}
          <div>
            <button onClick={() => toggleCategory('video')} className="flex items-center justify-between w-full text-sm text-gray-400 hover:text-white font-semibold">
              <span>VIDEO SESSIONS</span>
              <div className="hover:bg-gray-600 rounded p-0.5"><PlusIcon className="h-4 w-4" /></div>
            </button>
            {openCategories.video && (
              <div className="mt-2 space-y-1 pl-2">
                {(project.videoChannels || []).map(c => <ChannelLink key={c.id} channel={c} type="video"/>)}
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

function ProjectContentArea({ project }: { project: Project }) {
    const selectedChannelName = "general";
    return (
        <div className="flex-1 flex flex-col bg-[#101010]">
            <header className="flex items-center h-12 px-4 border-b border-gray-700 shadow-sm flex-shrink-0">
                <HashtagIcon className="h-6 w-6 text-gray-500" />
                <h3 className="font-semibold ml-2">{selectedChannelName}</h3>
            </header>
            <main className="flex-1 flex flex-col justify-center items-center p-6">
                 <div className="text-left max-w-lg">
                    <h1 className="text-4xl font-bold mb-2">Welcome to {project.name}!</h1>
                    <p className="text-gray-400 mb-8">This is your project&apos;s main workspace. Here are some steps to help you get started:</p>
                    <div className="space-y-3">
                        <a href="#" className="flex items-center gap-x-4 p-3 bg-[#181818] rounded-md border border-gray-700 hover:border-gray-500">
                          <UserPlusIcon className="h-6 w-6 text-green-400"/>
                          <div>
                            <h4 className="font-semibold">Invite your collaborators</h4>
                            <p className="text-sm text-gray-400">Get the team started by adding teammates to this project.</p>
                          </div>
                        </a>
                        <a href="#" className="flex items-center gap-x-4 p-3 bg-[#181818] rounded-md border border-gray-700 hover:border-gray-500">
                          <PaperAirplaneIcon className="h-6 w-6 text-green-400"/>
                          <div>
                            <h4 className="font-semibold">Send your first message</h4>
                            <p className="text-sm text-gray-400">Say hello to the rest of the team in the general channel.</p>
                          </div>
                        </a>
                        <a href="#" className="flex items-center gap-x-4 p-3 bg-[#181818] rounded-md border border-gray-700 hover:border-gray-500">
                          <Cog6ToothIcon className="h-6 w-6 text-green-400"/>
                          <div>
                            <h4 className="font-semibold">Configure your project</h4>
                            <p className="text-sm text-gray-400">Update settings, branches, and user roles.</p>
                          </div>
                        </a>
                        <a href="#" className="flex items-center gap-x-4 p-3 bg-[#181818] rounded-md border border-gray-700 hover:border-gray-500">
                          <FolderIcon className="h-6 w-6 text-green-400"/>
                          <div>
                            <h4 className="font-semibold">Create your first folder</h4>
                            <p className="text-sm text-gray-400">Organize your code files into main or branch folders.</p>
                          </div>
                        </a>
                    </div>
                </div>
            </main>
            <footer className="px-4 pb-4">
                <div className="bg-[#181818] rounded-lg p-2 flex items-center border border-gray-700">
                    <button className="p-2 text-gray-400 hover:text-white"><PlusIcon className="h-6 w-6"/></button>
                    <input type="text" placeholder={`Message #${selectedChannelName}`} className="flex-1 bg-transparent px-2 text-white placeholder-gray-500 focus:outline-none" />
                </div>
            </footer>
        </div>
    );
}

function DashboardContent() {
  return (
    <div className="flex-1 flex flex-col bg-[#101010] p-6">
      <header className="flex items-center h-12 px-4 border-b border-gray-700 shadow-sm flex-shrink-0">
        <h3 className="font-semibold ml-2">Home</h3>
      </header>
      <main className="flex-1 flex flex-col justify-center items-center">
        <div className="text-center max-w-lg mx-auto">
          <h1 className="text-4xl font-bold mb-2">Welcome to your dashboard!</h1>
          <p className="text-gray-400 mb-8">This is your personal workspace. Here are some steps to help you get started.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-x-4 p-4 bg-[#181818] rounded-md border border-gray-700 hover:border-gray-500 cursor-pointer">
              <UserPlusIcon className="h-6 w-6 text-green-400"/>
              <div>
                <h4 className="font-semibold">Invite your friends</h4>
                <p className="text-sm text-gray-400">Collaborate with others on your next project.</p>
              </div>
            </div>
            <div className="flex items-center gap-x-4 p-4 bg-[#181818] rounded-md border border-gray-700 hover:border-gray-500 cursor-pointer">
              <CodeBracketIcon className="h-6 w-6 text-green-400"/>
              <div>
                <h4 className="font-semibold">Create your new project</h4>
                <p className="text-sm text-gray-400">Get started on your new software or feature.</p>
              </div>
            </div>
            <div className="flex items-center gap-x-4 p-4 bg-[#181818] rounded-md border border-gray-700 hover:border-gray-500 cursor-pointer">
              <FolderIcon className="h-6 w-6 text-green-400"/>
              <div>
                <h4 className="font-semibold">Explore file organization</h4>
                <p className="text-sm text-gray-400">Organize your projects and files into folders.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


export default function Home() {
  const [modalView, setModalView] = useState<'closed' | 'initial' | 'create'>('closed');
  const [folderModal, setFolderModal] = useState<{isOpen: boolean; target: 'main' | 'branch' | null}>({isOpen: false, target: null});
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFolderPath, setActiveFolderPath] = useState<string | null>(null);

  // Use the API function to fetch projects
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const existingProjects = await getProjects();
        setProjects(existingProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchAllProjects();
  }, []); // The empty dependency array [] ensures this runs only once

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'mainCodeFolders' | 'branchCodeFolders' | 'textChannels' | 'videoChannels'>) => {
    try {
      // Use the API function to create the project
      const newProjectWithTeam = await createProject(projectData);

      setProjects(prev => [...prev, newProjectWithTeam]);
      setSelectedProject(newProjectWithTeam);
      setModalView('closed');

    } catch (error) {
      console.error("Project creation failed:", error);
      // Here you could show an error message to the user
    }
  };

  const handleOpenFolderModal = (target: 'main' | 'branch') => {
    setFolderModal({ isOpen: true, target: target });
  };

  const handleCreateFolder = async (folderName: string) => {
    if (!selectedProject || !folderModal.target) return;
    try {
      const updatedProject = await createFolder(selectedProject.id, {
        folderName: folderName,
        targetType: folderModal.target
      });
      // Replace old project with updated one
      setProjects(prev =>
        prev.map(p => p.id === updatedProject.id ? updatedProject : p)
      );
      setSelectedProject(updatedProject);
      setActiveFolderPath(`${folderModal.target}/${folderName}`);
      setFolderModal({ isOpen: false, target: null });
    } catch (error) {
      console.error("Folder creation failed:", error);
      // You could show an error message to the user here
    }
  };

  return (
    <div className="flex bg-[#101010] text-white min-h-screen">
      <div className="relative flex flex-col items-center bg-[#181818] shadow-lg border-r border-gray-700 w-20 pt-4">
        {/* New Home Button */}
        <div className="group relative mb-4">
          <Link href="/dashboard">
            <button className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-2xl hover:rounded-xl hover:bg-green-600 transition-all duration-200 ease-linear cursor-pointer">
              <HomeIcon className="h-6 w-6 text-white" />
            </button>
          </Link>
          <span className="absolute left-full z-10 ml-4 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1.5 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Home</span>
        </div>
        <div className="w-8 border-b-2 border-gray-700 mb-4"></div>
        <div className="group relative mb-4">
          <button className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-2xl hover:rounded-xl hover:bg-green-600 transition-all duration-200 ease-linear cursor-pointer"><Image src={compass} alt="Discover" width={24} height={24} /></button>
          <span className="absolute left-full z-10 ml-4 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1.5 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Discover Projects</span>
        </div>
        <div className="group relative mb-4">
          <button onClick={() => setModalView('initial')} className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-2xl hover:rounded-xl hover:bg-green-600 transition-all duration-200 ease-linear cursor-pointer"><span className="text-2xl text-green-400">+</span></button>
          <span className="absolute left-full z-10 ml-4 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1.5 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Add a New Project</span>
        </div>
        <div className="w-8 border-b-2 border-gray-700 mb-4"></div>
        <div className="flex flex-col space-y-2 w-full items-center px-2">
          {projects.map((project) => (
            <div key={project.id} className="group relative">
              <div onClick={() => setSelectedProject(project)} className={`w-12 h-12 flex items-center justify-center cursor-pointer bg-gray-700 rounded-2xl hover:rounded-xl transition-all duration-200 ease-linear ${selectedProject?.id === project.id ? 'ring-2 ring-white rounded-xl' : ''}`}>
                {project.name[0].toUpperCase()}
              </div>
              <span className="absolute left-full z-10 ml-4 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1.5 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{project.name}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedProject ? (
          <div className="flex flex-1">
            <ProjectChannelList
              project={selectedProject}
              onAddFolder={handleOpenFolderModal}
              // ✅ PASS THE NEW PROPS
              activeFolderPath={activeFolderPath}
              setActiveFolderPath={setActiveFolderPath}
            />
            <ProjectContentArea project={selectedProject} />
          </div>
      ) : (
        <DashboardContent />
      )}

      <FriendsSidebar />

      {modalView === 'initial' && <InitialProjectModal onClose={() => setModalView('closed')} onNavigateToCreate={() => setModalView('create')} />}
      {modalView === 'create' && <CreateProjectModal onClose={() => setModalView('closed')} onCreate={handleCreateProject} />}

      {folderModal.isOpen && (
        <CreateFolderModal
            onClose={() => setFolderModal({ isOpen: false, target: null })}
            onCreate={handleCreateFolder}
            targetType={folderModal.target === 'main' ? 'Main' : 'Branch'}
        />
      )}
    </div>
  );
}
