import { CustomerStatus, Role } from "../../../generated/prisma/enums";

export interface RegisterUserPayload{
    name:string,
    email:string,
    password:string,
    role:Role,
    status:CustomerStatus,
     location?: string;
  yearOfExperience?: number | string;
}