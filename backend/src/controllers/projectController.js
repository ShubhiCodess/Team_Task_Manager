import Project from "../models/Project.js";
import User from "../models/User.js";

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,

      createdBy: req.user._id,

      members: [
        {
          user: req.user._id,
          role: "ADMIN",
        },
      ],
    });

    res.status(201).json(project);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Check if logged-in user is ADMIN
    const admin = project.members.find(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === "ADMIN"
    );

    if (!admin) {
      return res.status(403).json({
        message: "Only admins can add members",
      });
    }

    // Check if user exists
    const userExists = await User.findById(userId);

    if (!userExists) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Prevent duplicate members
    const alreadyMember = project.members.find(
      (member) => member.user.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User already in project",
      });
    }

    // Add member
    project.members.push({
      user: userId,
      role: "MEMBER",
    });

    await project.save();

    res.status(200).json(project);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only MEMBERS
    const membersOnly = project.members.filter(
      (member) => member.role === "MEMBER"
    );

    res.status(200).json(membersOnly);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};