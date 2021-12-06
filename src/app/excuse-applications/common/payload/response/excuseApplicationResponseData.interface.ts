import { PresenceResponseData } from "src/app/presences/common/payload/response/presenceResponseData.interface";

export interface ExcuseApplicationResponseData {
    id: number,
    absence: PresenceResponseData,
    status: boolean,
    dateTime: string
}