import { ClassGroup } from "../classes-groups/class-group.model";
import { Lecture } from "../lectures/lecture.model";

export class ClassSession {
    constructor(
        public id: number,
        public nameIdentifier: string,
        public startDateTime: string,
        public endDateTime: string,
        public lecture: Lecture,
        public classGroup: ClassGroup,
        public presenceStatementStatus: boolean,
        public status: boolean
    ) {}
}