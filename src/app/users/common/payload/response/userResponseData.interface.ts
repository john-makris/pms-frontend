import { Role } from "src/app/users/role.model";

export interface UserResponseData {
    username: string;
    email: string;
    password: string;
    roles: Array<Role>;
    department: {
        id: number;
    }
    status: boolean;
}