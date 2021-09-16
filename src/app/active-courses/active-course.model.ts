import { Course } from "../courses/course.model";
import { AuthUser } from "../users/auth-user.model";

export class ActiveCourse {
    
    constructor(
        public id: number,
        public academicYear: string,
        public maxTheoryLectures: number,
        public maxLabLectures: number,
        public teachingStuff: AuthUser[],
        public students: AuthUser[],
        public course: Course,
        public status: boolean,
        public isDeleting?: boolean
    ) {}
}