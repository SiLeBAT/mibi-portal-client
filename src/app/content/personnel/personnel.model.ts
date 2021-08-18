export interface PersonellIdCard {
    prefix: string;
    name: string;
    gender: 'female' | 'male';
    infos: string[];
    email: string;
}
