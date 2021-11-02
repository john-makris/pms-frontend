import { Course } from "../courses/course.model";
import { UserData } from "../users/common/payload/response/userData.interface";

export class CourseSchedule {
    
    constructor(
        public id: number,
        public academicYear: string,
        public maxTheoryLectures: number,
        public maxLabLectures: number,
        public theoryLectureDuration: number,
        public labLectureDuration: number,
        public status: boolean,
        public teachingStuff: UserData[],
        public students: UserData[],
        public course: Course
    ) {}
}