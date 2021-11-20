import { ClassGroup } from "src/app/classes-groups/class-group.model";
import { UserData } from "src/app/users/common/payload/response/userData.interface";

export interface GroupStudentResponseData {
    classGroup: ClassGroup,
    student: UserData
}