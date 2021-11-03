import { Lecture } from "src/app/lectures/lecture.model";

export interface LecturesResponseData {
    lectures: Lecture[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}