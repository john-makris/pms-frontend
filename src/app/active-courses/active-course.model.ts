import { Course } from "../courses/course.model";
import { AuthUser } from "../users/auth-user.model";
import { UserData } from "../users/common/payload/response/userData.interface";

export class ActiveCourse {
    
    constructor(
        public id: number,
        public academicYear: string,
        public maxTheoryLectures: number,
        public maxLabLectures: number,
        public status: boolean,
        public teachingStuff: UserData[],
        public students: UserData[],
        public course: Course,
    ) {}
}