import { Course } from "src/app/courses/course.model";
import { UserData } from "src/app/users/common/payload/response/userData.interface";

export interface CourseScheduleRequestData {
    maxTheoryLectures: number,
    maxLabLectures: number,
    theoryLectureDuration: number,
    labLectureDuration: number,
    course: Course,
    teachingStuff: UserData[]
}