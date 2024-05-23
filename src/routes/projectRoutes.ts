import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middlewares/validation";
import { TaskController } from "../controllers/TaskController";
import {  validateProjectExists } from "../middlewares/project";
import { hasAuthorization, taskBelongToProject, taskExists } from "../middlewares/task";
import { authenticate } from "../middlewares/auth";
import { TeamMemberController } from "../controllers/TeamMemberController";
import { NoteController } from "../controllers/NoteController";
const router = Router()
// Al usar esto siempre que alguien se logee la req va a tener el objeto user del q se logeo
router.use(authenticate)

router.post('/',
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto debe ser obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente debe ser obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion del proyecto debe ser obligatorio'),
    handleInputErrors,
    ProjectController.createProject
)
router.get('/',
    ProjectController.getAllProjects
)
router.get('/:id',
    param('id').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    ProjectController.getProjectById
)
// Routes for tasks
router.param('projectId',validateProjectExists)
router.put('/:projectId',
    param('projectId').isMongoId().withMessage('Id no valido'),
    body('projectName')
        .notEmpty().withMessage('El nombre del proyecto debe ser obligatorio'),
    body('clientName')
        .notEmpty().withMessage('El nombre del cliente debe ser obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion del proyecto debe ser obligatorio'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.updateProject
)
router.delete('/:projectId',
    param('projectId').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    hasAuthorization,
    ProjectController.deleteProject
)


router.param('taskId', taskExists)
router.param('taskId', taskBelongToProject)
router.post('/:projectId/tasks',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Id de proyecto no valido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.createTask
)
router.get('/:projectId/tasks',
    param('projectId').isMongoId().withMessage('Id de proyecto no valido'),
    handleInputErrors,
    TaskController.getAllTaskByProjects
)
router.get('/:projectId/tasks/:taskId',
    param('projectId').isMongoId().withMessage('Id de proyecto no valido'),
    param('taskId').isMongoId().withMessage('Id de la tarea no valido'),
    handleInputErrors,
    TaskController.getTaskById
)
router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Id de proyecto no valido'),
    body('name')
        .notEmpty().withMessage('El nombre de la tarea es obligatorio'),
    body('description')
        .notEmpty().withMessage('La descripcion de la tarea es obligatoria'),
    handleInputErrors,
    TaskController.updateTask
)
router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Id de proyecto no valido'),
    param('taskId').isMongoId().withMessage('Id de la tarea no valido'),
    handleInputErrors,
    TaskController.deleteTask
)
router.post('/:projectId/tasks/:taskId/status',
    param('projectId').isMongoId().withMessage('Id de proyecto no valido'),
    param('taskId').isMongoId().withMessage('Id de la tarea no valido'),
    body('status').notEmpty().withMessage('El estado es obligatorio'),
    handleInputErrors,
    TaskController.updateStatus
)
// Routes for teams
router.post('/:projectId/team/find',
    param('projectId').isMongoId().withMessage('Id de proyecto no valido'),
    body('email').isEmail().toLowerCase().withMessage('E-mail no valido'),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
    
)
router.post('/:projectId/team',
    body('id').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TeamMemberController.addMemberById
)
router.delete('/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('Id no valido'),
    handleInputErrors,
    TeamMemberController.removeMemberById
)
router.get('/:projectId/team',
    param('projectId').isMongoId().withMessage('Id de proyecto no valido'),
    handleInputErrors,
    TeamMemberController.getProjectTeam
)
// Routes for Notes
router.post('/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('El contenido de la nota es obligatorio'),
    handleInputErrors,
    NoteController.createNote
)
router.get('/:projectId/tasks/:taskId/notes',
    NoteController.getTaskNotes
)
router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Id no válido'),
    handleInputErrors,
    NoteController.deleteNote
)
export default router