import { Department } from "src/app/departments/department.model";
import { School } from "src/app/schools/school.model";

export class SchoolsDepartment {
    
    constructor(
        public id: number,
        public school: School,
        public department: Department
    ) {}
}