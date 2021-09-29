import { Department } from "../departments/department.model";

export class Course {
    
    constructor(
        public id: number,
        public name: string,
        public semester: string,
        public department: Department
    ) {}
}