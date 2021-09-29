import { UserData } from "src/app/users/common/payload/response/userData.interface";

export interface ActiveCourseRequestData {
    academicYear: string,
    maxTheoryLectures: number,
    maxLabLectures: number,
    teachingStuff: UserData[],
    status: boolean,
    courseId: number
}