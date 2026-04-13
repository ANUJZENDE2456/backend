const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Task = require('../models/Task');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task CRUD
 */
const router = express.Router();

function taskView(task) {
  if (!task) return null;
  return {
    id: (task.id || task._id)?.toString(),
    title: task.title,
    description: task.description,
    status: task.status,
    owner_id: task.owner?.toString?.() || task.owner,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

/**
 * @swagger
 * /tasks:
 *   get:
 *     security: [{ bearerAuth: [] }]
 *     tags: [Tasks]
 *     summary: List tasks (admin gets all, user gets own)
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', authenticate, async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { owner: req.user.id };
  const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ tasks: tasks.map(taskView) });
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     security: [{ bearerAuth: [] }]
 *     tags: [Tasks]
 *     summary: Create task
 *     responses:
 *       201:
 *         description: Task created
 */
router.post(
  '/',
  authenticate,
  validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().trim().isLength({ max: 500 }).withMessage('Description too long'),
    body('status').optional().isIn(['pending', 'in_progress', 'done']).withMessage('Invalid status'),
  ]),
  async (req, res) => {
    const { title, description = '', status = 'pending' } = req.body;
    const task = await Task.create({ title, description, status, owner: req.user.id });
    res.status(201).json({ task: taskView(task) });
  }
);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     security: [{ bearerAuth: [] }]
 *     tags: [Tasks]
 *     summary: Get task by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200: { description: Task }
 *       404: { description: Not found }
 */
router.get(
  '/:id',
  authenticate,
  validate([param('id').isMongoId()]),
  async (req, res) => {
    const task = await Task.findById(req.params.id).lean();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role !== 'admin' && task.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ task: taskView(task) });
  }
);

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     security: [{ bearerAuth: [] }]
 *     tags: [Tasks]
 *     summary: Update task
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated task }
 */
router.put(
  '/:id',
  authenticate,
  validate([
    param('id').isMongoId(),
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim().isLength({ max: 500 }),
    body('status').optional().isIn(['pending', 'in_progress', 'done']),
  ]),
  async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role !== 'admin' && task.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.status = req.body.status ?? task.status;
    await task.save();
    res.json({ task: taskView(task) });
  }
);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     security: [{ bearerAuth: [] }]
 *     tags: [Tasks]
 *     summary: Delete task
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *     responses:
 *       204: { description: Deleted }
 */
router.delete(
  '/:id',
  authenticate,
  validate([param('id').isMongoId()]),
  async (req, res) => {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.user.role !== 'admin' && task.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await task.deleteOne();
    res.status(204).send();
  }
);

module.exports = router;
