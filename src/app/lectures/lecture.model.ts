import { CourseSchedule } from "../courses-schedules/course-schedule.model";
import { LectureType } from "./lecture-types/lecture-type.model";
import { Room } from "./rooms/room.model";

export class Lecture {
    
    constructor(
        public id: number,
        public nameIdentifier: string,
        public title: string,
        public lectureType: LectureType,
        public courseSchedule: CourseSchedule
    ) {}
}