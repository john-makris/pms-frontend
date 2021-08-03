import { Department } from "src/app/departments/department.model";

export interface DepartmentsResponseData {
    departments: Department[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}