import { ClassSessionResponseData } from "src/app/classes-sessions/common/payload/response/classSessionResponseData.interface";
import { UserResponseData } from "src/app/users/common/payload/response/userResponseData.interface";

export interface PresenceResponseData {
    id: number,
    status: boolean,
    excuseStatus: boolean,
    classSession: ClassSessionResponseData,
    student: UserResponseData,
    dateTime: string
}