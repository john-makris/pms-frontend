import { ActiveCourse } from "src/app/active-courses/active-course.model";

export interface ActiveCoursesResponseData {
    activeCourses: ActiveCourse[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}