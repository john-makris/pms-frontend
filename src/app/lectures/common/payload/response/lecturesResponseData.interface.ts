import { Lecture } from "src/app/lectures/lecture.model";
import { LectureResponseData } from "./lectureResponseData.interface";

export interface LecturesResponseData {
    lectures: LectureResponseData[],
    currentPage: number,
    totalItems: number,
    totalPages: number
}