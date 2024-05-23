// agregar userId
import { Resend } from 'resend';
import dotenv from 'dotenv'
dotenv.config()
const resend = new Resend(`${process.env.RESEND_API_KEY}`);
interface IEmail {
    email:string,
    name:string,
    token:string,
    tokenId: string
}
export class AuthEmail {
    static sendConfirmationEmail = async (user:IEmail)=>{
        
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [`${user.email}`],
            subject: 'Uptask - Confirma tu cuenta',
            html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo solo debes confirmar tu cuenta</p>
                            <p>Visita el siente enlace: </p> <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                            <p>E ingresa el siguiente codigo: <b>${user.token}</b></p>
                            <p>Este token expira en 10 m</p>`,
        });

        if (error) {
            return console.error({ error });
        }

        console.log({ data });
}

    static sendPasswordResetToken = async (user:IEmail)=>{
        const { data, error } = await resend.emails.send({
                from: 'Acme <onboarding@resend.dev>',
                to : [`${user.email}`],
                subject: 'Uptask - Reestablece tu password',
                html: `<p>Hola ${user.name}, has solicitado reestablecer tu password</p>
                    <p>Visita el siente enlace: </p> <a href="${process.env.FRONTEND_URL}/auth/new-password/${user.tokenId}">Reestablecer password</a>
                    <p>E ingresa el siguiente codigo: <b>${user.token}</b></p>
                    <p>Este token expira en 10 m</p>
                `
            })
        if (error) {
            return console.error({ error });
        }

        console.log({ data });
    }
    
}