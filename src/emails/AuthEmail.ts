import { transporter } from "../config/nodemailers"
// agregar userId
interface IEmail {
    email:string,
    name:string,
    token:string,
    tokenId: string
}
export class AuthEmail {
    static sendConfirmationEmail = async (user:IEmail)=>{
        const info = await transporter.sendMail({
                from: 'UpTask <admin@uptask.com>',
                to : user.email,
                subject: 'Uptask - Confirma tu cuenta',
                text: 'Uptask - Confirma tu cuenta',
                html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo solo debes confirmar tu cuenta</p>
                    <p>Visita el siente enlace: </p> <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                    <p>E ingresa el siguiente codigo: <b>${user.token}</b></p>
                    <p>Este token expira en 10 m</p>
                
                
                `
            })
        console.log('Mensaje enviado', info.messageId)
    }
    static sendPasswordResetToken = async (user:IEmail)=>{
        const info = await transporter.sendMail({
                from: 'UpTask <admin@uptask.com>',
                to : user.email,
                subject: 'Uptask - Reestablece tu password',
                text: 'Uptask - Reestablece tu password',
                html: `<p>Hola ${user.name}, has solicitado reestablecer tu password</p>
                    <p>Visita el siente enlace: </p> <a href="${process.env.FRONTEND_URL}/auth/new-password/${user.tokenId}">Reestablecer password</a>
                    <p>E ingresa el siguiente codigo: <b>${user.token}</b></p>
                    <p>Este token expira en 10 m</p>
                
                
                `
            })
        console.log('Mensaje enviado', info.messageId)
    }
    
}