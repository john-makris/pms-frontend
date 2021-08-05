import { Course } from "../courses/course.model";
import { User } from "../user/user.model";

export class ActiveCourse {
    
    constructor(
        public id: number,
        public academicYear: string,
        public maxTheoryLectures: number,
        public maxLabLectures: number,
        public teachingStuff: User[],
        public students: User[],
        public course: Course,
        public status: boolean,
        public isDeleting?: boolean
    ) {}
}