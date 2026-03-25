import { UserRoles } from "../model/user-roles";

export class UserModel {

    public email: string;
    public urid: string;
    public name: string;
    // public role: UserRoles;
    public isActive: boolean;
    public isAdmin: boolean;
    public phoneNumber: string;
    public vat: string;
    constructor(urid: string, email: string, name: string, isActive?: boolean, isAdmin?: boolean, phoneNumber?: string, vat?: string) {
        this.urid = urid;
        this.email = email;
        this.name = name;
        this.isActive = isActive;
        this.isAdmin = isAdmin;
        this.phoneNumber = phoneNumber || '';
        this.vat = vat || '';
    }
}