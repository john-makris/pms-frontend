import { Department } from "src/app/departments/department.model";

export interface AuthResponseData {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    roles: Array<string>;
    tokenType: string;
    accessToken: string;
    accessTokenExpiryDate: Date;
    refreshToken: string;
    refreshTokenExpiryDate: Date;
    department: Department;
    status: boolean;
}