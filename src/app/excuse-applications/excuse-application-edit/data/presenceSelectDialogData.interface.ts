import { UserResponseData } from "src/app/users/common/payload/response/userResponseData.interface";

export interface PresenceSelectDialogData {
    user: UserResponseData,
    presenceStatus: boolean | null
}