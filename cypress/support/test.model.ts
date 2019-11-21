export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    instituteId: string;
    password: string;
}

export interface Credentials {
    email: string;
    password: string;
}
