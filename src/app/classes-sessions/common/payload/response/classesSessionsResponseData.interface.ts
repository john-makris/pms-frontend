import { ClassSessionResponseData } from "./classSessionResponseData.interface";

export interface ClassesSessionsResponseData {
    classesSessions: ClassSessionResponseData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}