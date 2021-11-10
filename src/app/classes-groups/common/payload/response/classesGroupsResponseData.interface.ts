import { ClassGroupResponseData } from "./classGroupResponseData.interface";

export interface ClassesGroupsResponseData {
    classesGroups: ClassGroupResponseData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}