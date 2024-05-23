import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'
type UserPayload = {
    id: Types.ObjectId
}
// el payload va a tener el id del usuario
export const generateJWT =(payload:UserPayload)=>{
    const token = jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn: '180d'
    })
    return token
}
