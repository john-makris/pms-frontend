import { ExcuseApplicationResponseData } from "./excuseApplicationResponseData.interface";

export interface ExcuseApplicationsResponseData {
    excuseApplications: ExcuseApplicationResponseData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}