import { CourseSchedule } from "../courses-schedules/course-schedule.model";
import { LectureType } from "../lectures/lecture-types/lecture-type.model";
import { Room } from "./rooms/room.model";

export class ClassGroup {
    
    constructor(
        public id: number,
        public nameIdentifier: string,
        public startTime: string,
        public endTime: string,
        public capacity: number,
        public groupType: LectureType,
        public room: Room,
        public courseSchedule: CourseSchedule
    ) {}
}