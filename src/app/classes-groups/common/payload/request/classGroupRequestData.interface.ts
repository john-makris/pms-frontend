import { Room } from "src/app/classes-groups/rooms/room.model";
import { CourseSchedule } from "src/app/courses-schedules/course-schedule.model";
import { LectureType } from "src/app/lectures/lecture-types/lecture-type.model";

export interface ClassGroupRequestData {
    identifierSuffix: string,
    startTime: string,
    capacity: number,
    groupType: LectureType,
    status: boolean,
    courseSchedule: CourseSchedule,
    room: Room
}