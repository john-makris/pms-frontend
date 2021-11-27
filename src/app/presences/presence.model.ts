import { ClassSession } from "../classes-sessions/class-session.model";
import { UserData } from "../users/common/payload/response/userData.interface";

export class Presence {
    
    constructor(
        public id: number,
        public status: boolean,
        public classSession: ClassSession,
        public student: UserData
    ) {}
}