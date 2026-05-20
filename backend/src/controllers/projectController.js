import Project from "../models/Project.js";
import User from "../models/User.js";

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,

      createdBy: req.user.id,

      members: [
        {
          user: req.user.id,
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

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user.id,
    });

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const adminMember = project.members.find(
      (member) =>
        member.user.toString() === req.user.id &&
        member.role === "ADMIN"
    );

    if (!adminMember) {
      return res.status(403).json({
        message: "Only admins can add members",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyMember = project.members.find(
      (member) => member.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "User already in project",
      });
    }

    project.members.push({
      user: user._id,
      role: "MEMBER",
    });

    await project.save();

    res.status(200).json({
      message: "Member added successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};