import Project from '../models/Project.js';
import Task from '../models/Task.js';

const taskPopulate = [
  { path: 'project', select: 'name members' },
  { path: 'assignedTo', select: 'name email role' },
  { path: 'createdBy', select: 'name email role' }
];

const memberCanAccessTask = (task, user) =>
  task.assignedTo._id.toString() === user._id.toString() ||
  task.project.members.some((memberId) => memberId.toString() === user._id.toString());

const ensureAssigneeIsProjectMember = async (projectId, assignedTo) => {
  const project = await Project.findById(projectId);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const isMember = project.members.some((id) => id.toString() === assignedTo);

  if (!isMember) {
    const error = new Error('Assigned user must be a project member');
    error.statusCode = 400;
    throw error;
  }

  return project;
};

export const listTasks = async (req, res, next) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(query).populate(taskPopulate).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    await ensureAssigneeIsProjectMember(req.body.project, req.body.assignedTo);

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      project: req.body.project,
      assignedTo: req.body.assignedTo,
      status: req.body.status,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      createdBy: req.user._id
    });

    res.status(201).json(await task.populate(taskPopulate));
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate(taskPopulate);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (req.user.role !== 'Admin' && !memberCanAccessTask(task, req.user)) {
      res.status(403);
      throw new Error('Access denied');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (req.body.project || req.body.assignedTo) {
      await ensureAssigneeIsProjectMember(
        req.body.project || task.project.toString(),
        req.body.assignedTo || task.assignedTo.toString()
      );
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.project = req.body.project ?? task.project;
    task.assignedTo = req.body.assignedTo ?? task.assignedTo;
    task.status = req.body.status ?? task.status;
    task.priority = req.body.priority ?? task.priority;
    task.dueDate = req.body.dueDate ?? task.dueDate;

    await task.save();
    res.json(await task.populate(taskPopulate));
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate(taskPopulate);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (req.user.role !== 'Admin' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only the assignee can update this task status');
    }

    task.status = req.body.status;
    await task.save();

    res.json(await task.populate(taskPopulate));
  } catch (error) {
    next(error);
  }
};
