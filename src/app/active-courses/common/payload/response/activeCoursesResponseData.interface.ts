import { ActiveCourse } from "src/app/active-courses/active-course.model";

export interface ActiveCoursesResponseData {
    activeCourse: ActiveCourse[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}