import { Role } from "src/app/users/role.model";

export interface UserResponseData {
    id: number;
    am: string | null;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    roles: Array<Role>;
    department: {
        id: number;
    } | null;
    status: boolean | null;
}