import { Course } from "src/app/courses/course.model";
import { Semester } from "src/app/courses/semester.model";
import { Department } from "src/app/departments/department.model";

export interface CourseResponseData {
    id: number,
    name: string,
    semester: Semester,
    department: Department
}