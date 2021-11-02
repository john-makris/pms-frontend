import { CourseSchedule } from "../courses-schedules/course-schedule.model";
import { LectureType } from "./lecture-types/lecture-type.model";
import { Room } from "./rooms/room.model";

export class Lecture {
    
    constructor(
        public id: number,
        public lectureType: LectureType,
        public title: string,
        public duration: number,
        public startTimestamp: string,
        public room: Room,
        public excuseAbsencesLimit: number,
        public presenceStatementStatus: boolean,
        public courseSchedule: CourseSchedule
    ) {}
}