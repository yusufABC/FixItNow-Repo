import jwt,{ JwtPayload, SignOptions } from "jsonwebtoken"

const createJwt=(payload:JwtPayload,secret:string,expiresIn:SignOptions)=>{
const token=jwt.sign(
    payload,
    secret,
    {
        expiresIn 
}as SignOptions)
return token
}

const verifyToken=(accessToken:string,secret:string)=>{
   try {
     const verifiedToken=jwt.verify(accessToken,secret)
     return {
        success:true,
        data:verifiedToken
     }
   } catch (error:any) {
    return{
        success:false,
        error:error.message
    }
   }
}

export const jwtUtils={
    createJwt,
    verifyToken
}


