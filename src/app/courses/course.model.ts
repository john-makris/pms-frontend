import { Department } from "../departments/department.model";
import { Semester } from "./semester.model";

export class Course {
    
    constructor(
        public id: number,
        public name: string,
        public semester: Semester,
        public department: Department
    ) {}
}