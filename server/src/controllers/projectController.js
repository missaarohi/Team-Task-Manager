import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const projectPopulate = [
  { path: 'members', select: 'name email role' },
  { path: 'createdBy', select: 'name email role' }
];

const canAccessProject = (project, user) =>
  user.role === 'Admin' || project.members.some((member) => member._id.toString() === user._id.toString());

export const listProjects = async (req, res, next) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { members: req.user._id };
    const projects = await Project.find(query).populate(projectPopulate).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const memberIds = [...new Set([...(req.body.members || []), req.user._id.toString()])];
    const members = await User.find({ _id: { $in: memberIds } });

    if (members.length !== memberIds.length) {
      res.status(400);
      throw new Error('One or more members do not exist');
    }

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      members: memberIds,
      createdBy: req.user._id
    });

    res.status(201).json(await project.populate(projectPopulate));
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate(projectPopulate);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (!canAccessProject(project, req.user)) {
      res.status(403);
      throw new Error('Access denied');
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email role')
      .populate('project', 'name')
      .sort({ dueDate: 1 });

    res.json({ project, tasks });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    project.name = req.body.name ?? project.name;
    project.description = req.body.description ?? project.description;

    if (req.body.members) {
      const memberIds = [...new Set(req.body.members)];
      const members = await User.find({ _id: { $in: memberIds } });

      if (members.length !== memberIds.length) {
        res.status(400);
        throw new Error('One or more members do not exist');
      }

      project.members = memberIds;
    }

    await project.save();
    res.json(await project.populate(projectPopulate));
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project and related tasks deleted' });
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (req, res, next) => {
  try {
    const [project, user] = await Promise.all([
      Project.findById(req.params.id),
      User.findById(req.body.userId)
    ]);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (!project.members.some((id) => id.toString() === user._id.toString())) {
      project.members.push(user._id);
      await project.save();
    }

    res.json(await project.populate(projectPopulate));
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const hasAssignedTasks = await Task.exists({
      project: project._id,
      assignedTo: req.params.userId,
      status: { $ne: 'Completed' }
    });

    if (hasAssignedTasks) {
      res.status(400);
      throw new Error('Cannot remove member with open assigned tasks');
    }

    project.members = project.members.filter((id) => id.toString() !== req.params.userId);
    await project.save();

    res.json(await project.populate(projectPopulate));
  } catch (error) {
    next(error);
  }
};
