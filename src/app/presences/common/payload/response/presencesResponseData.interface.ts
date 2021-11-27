import { PresenceResponseData } from "./presenceResponseData.interface";

export interface PresencesResponseData {
    presences: PresenceResponseData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}