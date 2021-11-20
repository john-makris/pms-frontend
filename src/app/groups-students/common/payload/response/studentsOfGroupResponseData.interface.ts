import { StudentOfGroupResponseData } from "./studentOfGroupResponseData.interface";

export interface StudentsOfGroupResponseData {
    studentsOfGroup: StudentOfGroupResponseData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}