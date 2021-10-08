import { ActiveCourseResponseData } from "../data/activeCourseData.interface";

export interface ActiveCoursesResponseData {
    activeCourses: ActiveCourseResponseData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}