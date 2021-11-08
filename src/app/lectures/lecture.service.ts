import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LectureRequestData } from "./common/payload/request/lectureRecuestData.interface";
import { LectureResponseData } from "./common/payload/response/lectureResponseData.interface";
import { LecturesResponseData } from "./common/payload/response/lecturesResponseData.interface";
import { Lecture } from "./lecture.model";

const API_URL = 'http://localhost:8080/pms/lectures/';

@Injectable({
    providedIn: 'root'
})
export class LectureService {

    lectureIdSubject = new BehaviorSubject<number>(0);

    lectureIdState = this.lectureIdSubject.asObservable();

    lectureTableLoadedSubject = new BehaviorSubject<boolean>(false);

    lectureTableLoadedState = this.lectureTableLoadedSubject.asObservable();

    identifierSuffixesSubject = new BehaviorSubject<Array<string>>([]);

    identifierSuffixesState = this.identifierSuffixesSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPageLectures(params: HttpParams): Observable<any> {
        return this.http.get<LecturesResponseData[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllPageLecturesByDepartmentId(params: HttpParams): Observable<any> {
        return this.http.get<LecturesResponseData[]>(API_URL + 'all/by_department/paginated_sorted_filtered', { params });
    }

    getAllPageLecturesByCourseScheduleId(params: HttpParams): Observable<any> {
        return this.http.get<LecturesResponseData[]>(API_URL + 'all/by_department/paginated_sorted_filtered', { params });
    }

    getAllPageLecturesByDepartmentIdAndCourseScheduleId(params: HttpParams): Observable<any> {
        return this.http.get<LecturesResponseData[]>(API_URL + 'all/by_course-schedule_per_department/paginated_sorted_filtered', { params });
    }

    getAllPageLecturesByDepartmentIdAndCourseScheduleIdPerType(params: HttpParams): Observable<any> {
        return this.http.get<LecturesResponseData[]>(API_URL + 'all/by_course-scheduleId_and_type_per_department/paginated_sorted_filtered', { params });
    }

    getAllLectures(): Observable<Lecture[]> {
        return this.http.get<Lecture[]>(API_URL + 'all');
    }

    getLectureById(lectureId: number): Observable<LectureResponseData> {
        return this.http.get<LectureResponseData>(API_URL + lectureId);
    }

    deleteAllLectures(): Observable<Lecture[]> {
        return this.http.delete<Lecture[]>(API_URL + 'delete/all')
    }

    deleteLectureById(lectureId: number): Observable<Lecture> {
        return this.http.delete<Lecture>(API_URL + 'delete/' + lectureId);
    }

    createLecture(lectureData: LectureRequestData): Observable<LectureRequestData> {
        return this.http.post<LectureRequestData>(API_URL + 'create/', lectureData);
    }

    updateLecture(lectureId: number, lectureData: LectureRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + lectureId, lectureData);
    }
}