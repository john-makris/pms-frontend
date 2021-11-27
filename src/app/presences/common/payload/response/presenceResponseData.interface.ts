import { ClassSession } from "src/app/classes-sessions/class-session.model";
import { UserResponseData } from "src/app/users/common/payload/response/userResponseData.interface";

export interface PresenceResponseData {
    id: number,
    status: boolean,
    classSession: ClassSession,
    student: UserResponseData
}