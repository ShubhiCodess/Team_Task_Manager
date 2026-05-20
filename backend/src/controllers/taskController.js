import Task from "../models/Task.js";
import Project from "../models/Project.js";

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedTo,
      dueDate,
    } = req.body;

    const project = await Project.findById(projectId);

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
        message: "Only admins can create tasks",
      });
    }

    // Ensure assigned users are MEMBERS of project
    const validMembers = assignedTo.every((userId) =>
      project.members.some(
        (member) =>
          member.user.toString() === userId &&
          member.role === "MEMBER"
      )
    );

    if (!validMembers) {
      return res.status(400).json({
        message: "Some users are not valid project members",
      });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      assignedBy: req.user._id,
      dueDate,
    });

    res.status(201).json(task);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyTasks = async (req, res) => {
  try {

    const tasks = await Task.find({
      assignedTo: req.user._id,
    })
      .populate("project", "name")
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email");

    res.status(200).json(tasks);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const task = await Task.findById(req.params.id)
      .populate("project");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check if user is assigned
    const isAssigned = task.assignedTo.some(
      (userId) =>
        userId.toString() === req.user._id.toString()
    );

    // Check if user is admin
    const isAdmin = task.project.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === "ADMIN"
    );

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({
        message: "Not authorized to update this task",
      });
    }

    task.status = status;

    await task.save();

    res.status(200).json(task);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const addComment = async (req, res) => {
  try {

    const { text } = req.body;

    const task = await Task.findById(req.params.id)
      .populate("project");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check if user is assigned
    const isAssigned = task.assignedTo.some(
      (userId) =>
        userId.toString() === req.user._id.toString()
    );

    // Check if user is admin
    const isAdmin = task.project.members.some(
      (member) =>
        member.user.toString() === req.user._id.toString() &&
        member.role === "ADMIN"
    );

    if (!isAssigned && !isAdmin) {
      return res.status(403).json({
        message: "Not authorized to comment",
      });
    }

    task.comments.push({
      user: req.user._id,
      text,
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("comments.user", "name email");

    res.status(200).json(updatedTask);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {

    const tasks = await Task.find({
      assignedTo: req.user._id,
    });

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "DONE"
    ).length;

    const pendingTasks = tasks.filter(
      (task) => task.status === "TODO"
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "IN_PROGRESS"
    ).length;

    const overdueTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        task.status !== "DONE"
    ).length;

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};