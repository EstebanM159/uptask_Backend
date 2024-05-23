import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation";
import { authenticate } from "../middlewares/auth";
const router = Router()
router.post('/create-account', 
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('password').isLength({min:8}).withMessage('La contraseña es muy corta, minimo 8 caracteres'),
    body('password_confirmation').custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Las contraseñas deben ser iguales')
        }
        return true
    }),
    body('email').isEmail().withMessage('Email no valido'),
        handleInputErrors,
        AuthController.createAcount
)
router.post('/confirm-account',
    body('token').notEmpty().withMessage('El token no puede ir vacio'),
    handleInputErrors,
    AuthController.confirmAccount

)
router.post('/login',
    body('email').isEmail().withMessage('Email no valido'),
    body('password').notEmpty().withMessage('La password no puede ir vacio'),
    handleInputErrors,
    AuthController.login
)
router.post('/request-code',
    body('email').isEmail().withMessage('Email no valido'),
    handleInputErrors,
    AuthController.requestConfirmationCode
)
router.post('/forgot-password',
    body('email').isEmail().withMessage('Email no valido'),
    handleInputErrors,
    AuthController.forgotPassword
)
router.post('/validate-token',
    body('token').notEmpty().withMessage('El token no puede ir vacio'),
    handleInputErrors,
    AuthController.validateToken
)   
router.post('/update-password/:token',
    param('token').isNumeric().withMessage('token no valido'),
    body('password').isLength({min:8}).withMessage('La contraseña es muy corta, minimo 8 caracteres'),
    body('password_confirmation').custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Las contraseñas deben ser iguales')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updatePasswordWithToken
) 
router.get('/user',
    authenticate,
    AuthController.user
)
// Profile
router.put('/profile',
    authenticate,
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Email no valido'),
    handleInputErrors,
    AuthController.updateProfile
)
router.post('/profile/update-password',
    authenticate,
    body('current_password').notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('password').isLength({min:8}).withMessage('La contraseña es muy corta, minimo 8 caracteres'),
    body('password_confirmation').custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Las contraseñas deben ser iguales')
        }
        return true
    }),
    handleInputErrors,
    AuthController.updateCurrentUserPassword
)
router.post('/check-password',
    authenticate,
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
    handleInputErrors,
    AuthController.checkPassword
)
export default router