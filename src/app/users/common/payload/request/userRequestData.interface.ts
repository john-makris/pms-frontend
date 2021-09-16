import { Department } from "src/app/departments/department.model";

export interface UserRequestData {
    username: string;
    email: string;
    roles: Array<string>;
    password: string;
    am: string;
    department: Department;
}