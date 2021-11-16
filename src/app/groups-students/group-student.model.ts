import { ClassGroup } from "../classes-groups/class-group.model";
import { UserData } from "../users/common/payload/response/userData.interface";

export class GroupStudent {

    constructor(
        public id: number,
        public classGroup: Array<ClassGroup>,
        public students: Array<UserData>
    ) {}
}