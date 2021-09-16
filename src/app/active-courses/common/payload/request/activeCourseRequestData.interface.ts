import { UserData } from "src/app/users/common/payload/response/userData.interface";

export interface ActiveCourseRequestData {
    academicYear: string,
    maxTheoryLectures: number,
    maxLabLectures: number,
    teachingStuff: UserData[],
    students: UserData[],
    status: boolean,
    course: {
        id: number
    }
}