export interface User {
    email: string;
    firstName?: string;
    lastName?: string;
    instituteId: string;
    _id: string;
}
export interface TokenizedUser extends User {
    token: string;
}
export interface Credentials {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    instituteId: string;
}
