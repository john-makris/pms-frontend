import { CourseSchedule } from "src/app/courses-schedules/course-schedule.model";
import { LectureType } from "src/app/lectures/lecture-types/lecture-type.model";

export interface LectureResponseData {
    id: number,
    courseSchedule: CourseSchedule,
    lectureType: LectureType,
    identifierSuffix: string,
    nameIdentifier: string,
    title: string
}