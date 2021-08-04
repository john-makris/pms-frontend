import { School } from "src/app/schools/school.model";

export interface SchoolResponseData {
    schools: School[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}