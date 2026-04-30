import Project from '../models/Project.js';
import Task from '../models/Task.js';

export const getDashboard = async (req, res, next) => {
  try {
    const taskQuery = req.user.role === 'Admin' ? {} : { assignedTo: req.user._id };
    const projectQuery = req.user.role === 'Admin' ? {} : { members: req.user._id };
    const now = new Date();

    const [totalProjects, totalTasks, pending, inProgress, completed, overdue, recentTasks] = await Promise.all([
      Project.countDocuments(projectQuery),
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'Pending' }),
      Task.countDocuments({ ...taskQuery, status: 'In Progress' }),
      Task.countDocuments({ ...taskQuery, status: 'Completed' }),
      Task.countDocuments({ ...taskQuery, status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
      Task.find(taskQuery).populate('project', 'name').populate('assignedTo', 'name email role').sort({ dueDate: 1 }).limit(8)
    ]);

    res.json({
      totalProjects,
      totalTasks,
      statusCounts: {
        pending,
        inProgress,
        completed
      },
      overdue,
      recentTasks
    });
  } catch (error) {
    next(error);
  }
};
