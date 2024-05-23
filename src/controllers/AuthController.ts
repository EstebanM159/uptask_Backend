import type { Request, Response } from "express"
import User from "../models/Auth"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"
export class AuthController {
    static createAcount = async (req:Request,res:Response) => {
        try {
            const {password, email} = req.body
            const userExists = await User.findOne({email})
            // Valido usuarios duplicados
            if(userExists){
                const error = new Error('El usuario ya esta registrado')
                return res.status(409).json({error : error.message})
            }
            const user = new User(req.body)
            // Hasheo password
            user.password = await hashPassword(password)
            // Genero token de validación
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email:user.email,
                name:user.name,
                token: token.token,
                tokenId: token._id
            })
            await Promise.allSettled([user.save(),token.save()])
            res.send('Cuenta creada correctamente, revisa tu email para confirmarla')
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }
    static confirmAccount = async (req:Request,res:Response) => {
        try {
            const {token} = req.body
            // Verifico que el token existe
            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                const error = new Error('Token no valido')
                return res.status(401).json({error : error.message})
            }
            // Verifico a que usuario le corresponde el token
            const user = await User.findById(tokenExists.user)
            // Le confirmo la cuenta
            user.confirmed = true
            // Guardo la confirmacion y borro el token correspondiente
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada correctamente')
            
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }
    static login = async (req:Request,res:Response) => {
        try {
            const {password, email} = req.body
            const user = await User.findOne({email})
            // verifico si existe el usuario
            if(!user){
                const error = new Error('Usuario no registrado')
                return res.status(404).json({error : error.message})
            }
            // verifico si tiene la cuenta confirmada sino envio el mail con token
            if(!user.confirmed){
                const token = new Token()
                token.token = generateToken()
                token.user = user.id
                await token.save()
                // Enviar email
                AuthEmail.sendConfirmationEmail({
                    email:user.email,
                    name:user.name,
                    token: token.token,
                tokenId: token._id

                })
                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmacion.')
                return res.status(401).json({error : error.message})
            }
            // Verifico password
            const isPasswordCorrect = await checkPassword(password, user.password)
            if(!isPasswordCorrect){
                const error = new Error('Password incorrecto.')
                return res.status(401).json({error : error.message})
            }
            // Si los datos son correctos se genera el AUTH_TOKEN y lo devuelve
            const token = generateJWT({id:user._id})
            // Esto se consume en el frontend
            res.send(token)
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }
    static requestConfirmationCode = async (req:Request,res:Response) => {
        try {
            const { email  }= req.body
            const user = await User.findOne({email})
            // Verifico si el usuario existe
            if(!user){
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json({error : error.message})
            }
            // Verifico si el usuario esta confirmado
            if(user.confirmed){
                const error = new Error('El usuario ya esta confirmado')
                return res.status(403).json({error : error.message})
            }
            // Verifico si el usuario tiene un token asignado
            const userId = user.id
            const tokenExists = Token.findOne({userId})
            if(tokenExists){
                const error = new Error('El token ya fue enviado a su email')
                return res.status(409).json({error : error.message})
            }
            // Genero token de validación
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            // Enviar email
            AuthEmail.sendConfirmationEmail({
                email:user.email,
                name:user.name,
                token: token.token,
                tokenId: token._id
            })
            await Promise.allSettled([user.save(),token.save()])
            res.send('Se envió un nuevo token, revise su email')
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }
    static forgotPassword = async (req:Request,res:Response) => {
        try {
            const { email  }= req.body
            const user = await User.findOne({email})
            // Verifico si el usuario existe
            if(!user){
                const error = new Error('El usuario no esta registrado')
                return res.status(404).json({error : error.message})
            }
            // Genero token de validación
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()
            // Este envio de email deberia tener el user id o el mismo email para no ingreasr un token no sea de ese usuario
            // Enviar email 
            AuthEmail.sendPasswordResetToken({
                email:user.email,
                name:user.name,
                token: token.token,
                tokenId: token._id
            })
            res.send('Revisa tu email para instrucciones')
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }

    static validateToken = async (req:Request,res:Response) => {
        try {
            const {token,tokenId} = req.body
            // Verifico que el token existe
            const tokenExists = await Token.findOne({token})
            // console.log(tokenExists)
            if(!tokenExists){
                const error = new Error('Token no valido')
                return res.status(401).json({error : error.message})
            }
            // Hacer lo mismo con la confirmacion de la cuenta
            if(tokenExists._id.toString() !== tokenId.toString()){
                const error = new Error('Token no valido')
                return res.status(401).json({error : error.message})
            }
            res.send('Token valido, Define tu nueva contraseña')
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }
        static updatePasswordWithToken = async (req:Request,res:Response) => {
        try {
            const {token} = req.params
            const {password} = req.body
            // Verifico que el token existe
            const tokenExists = await Token.findOne({token})
            if(!tokenExists){
                const error = new Error('Token no valido')
                return res.status(401).json({error : error.message})
            }
            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(password)
            // Guardo la contraseña y borro el token
            await Promise.allSettled([user.save(),tokenExists.deleteOne()])
            res.send('El password se modificó correctamente')
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }
    static user = async (req:Request,res:Response) => {
        return res.json(req.user)
    }
    static updateProfile = async (req:Request,res:Response) => {
        const {name,email}=req.body
        const userExists = await User.findOne({email})
        if(userExists && userExists.id.toString() !== req.user.id.toString()){
            const error = new Error('Ese email ya esta registrado')
            return res.status(409).json({error:error.message})
        }
        req.user.name = name
        req.user.email = email
        try {
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
        }
    }
    static updateCurrentUserPassword = async (req:Request,res:Response) => {
        const {current_password, password} = req.body
        const user = await User.findById(req.user.id)
        const isPasswordCorrect = await checkPassword(current_password,user.password)
        if(!isPasswordCorrect){
            const error = new Error('La contraseña actual es incorrecta')
            return res.status(401).json({error:error.message})
        }
        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('La contraseña se modificó correctamente')
            
        } catch (error) {
            res.status(500).json({error:'Hubo un error'})
            
        }

    }
    static checkPassword = async (req:Request,res:Response) => {
        const { password} = req.body
        const user = await User.findById(req.user.id)
        const isPasswordCorrect = await checkPassword(password,user.password)
        if(!isPasswordCorrect){
            const error = new Error('La contraseña es incorrecta')
            return res.status(401).json({error:error.message})
        }
        res.send('Contraseña correcta')
    }
}