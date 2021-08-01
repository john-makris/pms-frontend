import { Course } from "src/app/courses/course.model";

export interface CoursesResponseData {
    courses: Course[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}