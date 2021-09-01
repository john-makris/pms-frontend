import { UserData } from "./userData.interface";

export interface UserPageResponseData {
    users: UserData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}