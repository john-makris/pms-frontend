import { ClassGroupResponseData } from "src/app/classes-groups/common/payload/response/classGroupResponseData.interface";
import { LectureResponseData } from "src/app/lectures/common/payload/response/lectureResponseData.interface";

export interface ClassSessionResponseData {
    id: number,
    identifierSuffix: string,
	nameIdentifier: string,
	date: string,
	presenceStatementStatus: boolean,
	status: boolean,
	lecture: LectureResponseData,
	classGroup: ClassGroupResponseData
}