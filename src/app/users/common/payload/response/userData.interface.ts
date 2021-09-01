import { Department } from "src/app/departments/department.model";
import { Role } from "src/app/users/role.model";

export interface UserData {
    id: number,
    username: string,
    email: string,
    roles: Array<Role>,
    _accessToken: string,
    _tokenExpirationDate: Date,
    _refreshToken: string,
    _refreshTokenExpirationDate: Date,
    department: Department,
    status: boolean
}