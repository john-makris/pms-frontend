import { User } from "src/app/users/user.model";

export interface ActiveCourseRequestData {
    academicYear: string,
    maxTheoryLectures: number,
    maxLabLectures: number,
    teachingStuff: User[],
    students: User[],
    status: boolean,
    course: {
        id: number
    }
}