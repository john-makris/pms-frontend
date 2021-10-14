export interface CourseRequestData {
    name: string,
    semester: {
        id: number;
    },
    department: {
        id: number;
    }
}