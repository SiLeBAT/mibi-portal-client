export interface IUserData {
    department: string;
    contact: string;
    phone: string;
    email: string;
    _id: any;
}
export interface IUser {
    email: string;
    firstName?: string;
    lastName?: string;
    userData: IUserData[];
    institution: any;
    _id: any;
}

export interface ITokenizedUser extends IUser {
    token: string;
}
export interface ICredentials {
    email: string;
    password: string;
}

export interface IUserDetails {
    firstName?: string;
    lastName?: string;
    userData: IUserData[];
    institution: any;
}
