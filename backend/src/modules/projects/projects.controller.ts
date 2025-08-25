import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises'; // Use promises for async file operations
import path from 'path';

const prisma = new PrismaClient();

export const createProjectHandler = async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { name, description, isPrivate } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  try {
    const newProjectData = await prisma.$transaction(async (tx) => {
      // 1. Create the Team
      const newTeam = await tx.team.create({
        data: {
          name: `${name} Team`,
          ownerId: user.id,
        },
      });

      const newProject = await tx.project.create({
        data: {
          name,
          description,
          isPrivate,
          ownerId: user.id,
          teamId: newTeam.id,
        },
      });

      await tx.branch.create({
        data: {
          name: 'main',
          isMain: true,
          projectId: newProject.id,
          authorId: user.id,
        },
      });

      await tx.teamMember.create({
        data: {
          userId: user.id,
          teamId: newTeam.id,
          role: 'OWNER',
        },
      });

      return newProject;
    });

    const projectPath = path.join(process.cwd(), 'workspaces', `project_${newProjectData.id}`, 'main');
    await fs.mkdir(projectPath, { recursive: true });

    res.status(201).json(newProjectData);

  } catch (error) {
    console.error('Failed to create project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProjectsForUserHandler = async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        ownerId: user.id, // Or based on team membership
      },
      include: {
        branches: {
          include: {
            nodes: true, // 👈 pull all FileNodes per branch
          }
        }
      } 
    });
    
    // You must reconstruct the object to match the frontend's 'Project' type
    const projectsForFrontend = projects.map(p => {
      // Collect folders in main branch
      const mainBranch = p.branches.find(b => b.isMain);
      const mainCodeFolders = mainBranch
        ? mainBranch.nodes.filter(n => n.type === "FOLDER").map(n => n.name)
        : [];

      // Collect branch names (excluding main)
      const branchCodeFolders = p.branches
        .filter(b => !b.isMain)
        .map(b => b.name);

      return {
        ...p,
        mainCodeFolders,
        branchCodeFolders,
        textChannels: [
          { id: 'c3', name: 'general' },
          { id: 'c4', name: 'random' },
        ],
        videoChannels: [
          { id: 'c5', name: 'team-meeting' },
        ]
      };
    });

    res.status(200).json(projectsForFrontend);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createFolderHandler = async (req: Request, res: Response) => {
  // @ts-ignore
  const user = req.user;
  const { projectId } = req.params;
  const { folderName, targetType } = req.body; // 'main' or 'branch'

  if (!folderName || !targetType) {
    return res.status(400).json({ message: 'Folder name and target type are required' });
  }

  try {
    // --- Find the correct branch to add the folder to ---
    let targetBranch;

    if (targetType === 'main') {
      // Find the main branch for this project
      targetBranch = await prisma.branch.findFirst({
        where: {
          projectId: parseInt(projectId),
          isMain: true,
        },
      });
      if (!targetBranch) {
        return res.status(404).json({ message: 'Main branch not found for this project' });
      }
    } else {
      // If the target is 'branch', we create a NEW branch.
      // A "folder" in the "Branches" section is conceptually a new branch.
      targetBranch = await prisma.branch.create({
        data: {
          name: folderName,
          isMain: false,
          projectId: parseInt(projectId),
          authorId: user.id,
        },
      });
    }

    // --- Create the FileNode record in the database ---
    const newFolderNode = await prisma.fileNode.create({
      data: {
        name: folderName,
        type: 'FOLDER', // Set the type explicitly
        branchId: targetBranch.id,
        // parentId is null because this is a root folder in the branch for now
      },
    });

    // --- Create the physical folder on the server's file system ---
    const branchPath = targetBranch.isMain ? 'main' : path.join('branches', `${targetBranch.id}_${targetBranch.name}`);
    const fullPath = path.join(process.cwd(), 'workspaces', `project_${projectId}`, branchPath);
    
    // If it's the main branch, the new folder goes inside it.
    // If it's a new branch, the branch folder itself is what we're creating.
    const finalFolderPath = targetBranch.isMain ? path.join(fullPath, folderName) : fullPath;
    
    await fs.mkdir(finalFolderPath, { recursive: true });

    res.status(201).json({ 
        message: 'Folder/Branch created successfully', 
        data: newFolderNode 
    });
    const updatedProject = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        branches: { include: { nodes: true } }
      }
    });

    res.status(201).json({
      message: 'Folder/Branch created successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Failed to create folder/branch:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

