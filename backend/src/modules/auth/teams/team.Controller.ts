// backend/src/modules/teams/teams.controller.ts
import { Request, Response } from "express";
import prisma from "../../../config/db";

export const createTeam = async (req: Request, res: Response) => {
  const { name } = req.body;
  const user = (req as any).user; // from authMiddleware

  if (!name) {
    return res.status(400).json({ error: "Team name is required" });
  }

  try {
    const team = await prisma.team.create({
      data: {
        name,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER", // creator is owner
          },
        },
      },
      include: {
        owner: { select: { id: true, username: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, username: true, email: true } },
          },
        },
      },
    });

    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create team" });
  }
};

export const joinTeam = async (req: Request, res: Response) => {
  const { teamId } = req.body;
  const user = (req as any).user; // from authMiddleware

  if (!teamId) {
    return res.status(400).json({ error: "teamId is required" });
  }

  try {
    // Check if team exists
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Prevent duplicate join
    const existing = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: user.id, teamId } },
    });
    if (existing) {
      return res.status(400).json({ error: "Already a member of this team" });
    }

    // Add user to team as MEMBER
    const member = await prisma.teamMember.create({
      data: {
        userId: user.id,
        teamId,
        role: "MEMBER",
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
        team: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join team" });
  }
};