import { ClassGroup } from "src/app/classes-groups/class-group.model";
import { Lecture } from "src/app/lectures/lecture.model";

export interface ClassSessionRequestData {
    identifierSuffix: string,
    startDate: string,
    lecture: Lecture,
    classGroup: ClassGroup,
    presenceStatementStatus: boolean,
    status: boolean
}