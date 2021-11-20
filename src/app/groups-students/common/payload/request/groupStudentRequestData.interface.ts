import { ClassGroup } from "src/app/classes-groups/class-group.model";

export interface GroupStudentRequestData {
    classGroup: ClassGroup,
    studentId: number
}