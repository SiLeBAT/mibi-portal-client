export interface MeResponse {
    sub: string;
    email: string;
    preferred_username: string;
}

export interface LogoutResponse {
    endSessionUrl: string;
}
