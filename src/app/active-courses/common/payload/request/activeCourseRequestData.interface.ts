import { Course } from "src/app/courses/course.model";
import { UserData } from "src/app/users/common/payload/response/userData.interface";

export interface ActiveCourseRequestData {
    maxTheoryLectures: number,
    maxLabLectures: number,
    academicYear: string,
    course: Course,
    teachingStuff: UserData[],
    status: boolean
}