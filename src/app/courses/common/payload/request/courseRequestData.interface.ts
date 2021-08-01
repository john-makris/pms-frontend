export interface CourseRequestData {
    name: string,
    semester: string,
    department: {
        id: number;
    }
}