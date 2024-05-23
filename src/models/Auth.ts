import mongoose, {Schema, Document} from "mongoose";
export interface IUser extends Document {
    email:string
    password:string
    name:string
    confirmed:boolean
}
const UserSchema: Schema = new Schema ({
    email:{
        type:String,
        require:true,
        lowercase:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        require:true,
        trim:true
    },
    name:{
        type:String,
        require:true,
        trim:true
    },
    confirmed:{
        type:Boolean,
        require:true,
        default:false
    }
})
const User = mongoose.model<IUser>('User',UserSchema)
export default User