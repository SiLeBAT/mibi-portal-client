export interface MeResponse {
    sub: string;
    email: string;
    preferred_username: string;
    dataSaveAgreed: boolean;
    dataSaveViewed: boolean;
}

export interface LogoutResponse {
    endSessionUrl: string;
}
