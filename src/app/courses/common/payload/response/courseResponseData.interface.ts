import { Semester } from "src/app/courses/semesters/semester.model";
import { Department } from "src/app/departments/department.model";

export interface CourseResponseData {
    id: number,
    name: string,
    semester: Semester,
    department: Department
}