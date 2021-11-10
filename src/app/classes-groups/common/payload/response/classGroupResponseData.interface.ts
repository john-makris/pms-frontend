import { Room } from "src/app/classes-groups/rooms/room.model";
import { CourseSchedule } from "src/app/courses-schedules/course-schedule.model";
import { LectureType } from "src/app/lectures/lecture-types/lecture-type.model";

export interface ClassGroupResponseData {
    id: number,
    identifierSuffix: string,
    nameIdentifier: string,
    startTime: string,
    endTime: string,
    capacity: number,
    lectureType: LectureType,
    courseSchedule: CourseSchedule,
    room: Room
}