import { CourseSchedule } from "src/app/courses-schedules/course-schedule.model";
import { LectureType } from "src/app/lectures/lecture-types/lecture-type.model";
import { Room } from "src/app/lectures/rooms/room.model";

export interface LectureRequestData {
    courseSchedule: CourseSchedule,
    lectureType: LectureType,
    duration: number,
    startTimestamp: string,
    room: Room,
    title: string
}