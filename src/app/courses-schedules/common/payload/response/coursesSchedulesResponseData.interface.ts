import { CourseScheduleResponseData } from "./courseScheduleResponseData.interface";

export interface CoursesSchedulesResponseData {
    coursesSchedules: CourseScheduleResponseData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}