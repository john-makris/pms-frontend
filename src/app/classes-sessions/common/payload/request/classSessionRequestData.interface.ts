import { ClassGroup } from "src/app/classes-groups/class-group.model";
import { ClassGroupResponseData } from "src/app/classes-groups/common/payload/response/classGroupResponseData.interface";
import { LectureResponseData } from "src/app/lectures/common/payload/response/lectureResponseData.interface";
import { Lecture } from "src/app/lectures/lecture.model";

export interface ClassSessionRequestData {
    identifierSuffix: string,
    date: string,
    presenceStatementStatus: boolean,
    lecture: LectureResponseData,
    classGroup: ClassGroupResponseData
}