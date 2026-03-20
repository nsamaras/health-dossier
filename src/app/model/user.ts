import { UserRoles } from "./user-roles";

export interface User {
    email: string;
    name: string;
    role: UserRoles;
    uid: string;
  }