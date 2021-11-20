import { GroupStudentResponseData } from "./groupStudentResponseData.interface";

export interface GroupsStudentsResponseData {
    groupsStudents: GroupStudentResponseData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}