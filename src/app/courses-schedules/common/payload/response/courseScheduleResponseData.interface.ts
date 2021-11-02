import { Course } from "src/app/courses/course.model";
import { UserData } from "src/app/users/common/payload/response/userData.interface";

export interface CourseScheduleResponseData {
    id: number,
    maxTheoryLectures: number,
    maxLabLectures: number,
    theoryLectureDuration: number,
    labLectureDuration: number,
    academicYear: string,
    course: Course,
    teachingStuff: UserData[],
    status: boolean
}