import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LectureRequestData } from "./common/payload/request/lectureRequestData.interface";
import { LectureResponseData } from "./common/payload/response/lectureResponseData.interface";
import { LecturesResponseData } from "./common/payload/response/lecturesResponseData.interface";
import { Lecture } from "./lecture.model";

const API_URL = 'http://localhost:8080/pms/lectures/';

@Injectable({
    providedIn: 'root'
})
export class LectureService {

    lectureSubject = new BehaviorSubject<LectureResponseData | null>(null);

    lectureState = this.lectureSubject.asObservable();

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

    getAllPageLecturesByCourseScheduleIdPerType(params: HttpParams): Observable<any> {
        return this.http.get<LecturesResponseData[]>(API_URL + 'all/by_course-schedule_Id_and_type/paginated_sorted_filtered', { params });
    }

    getAllLectures(): Observable<Lecture[]> {
        return this.http.get<Lecture[]>(API_URL + 'all');
    }

    getLectureById(lectureId: number, userId: number): Observable<LectureResponseData> {
        return this.http.get<LectureResponseData>(API_URL + lectureId +'/' + userId);
    }

    deleteAllLectures(): Observable<Lecture[]> {
        return this.http.delete<Lecture[]>(API_URL + 'delete/all');
    }

    deleteLectureById(lectureId: number, userId: number): Observable<Lecture> {
        return this.http.delete<Lecture>(API_URL + 'delete/' + lectureId + '/' + userId);
    }

    createLecture(lectureData: LectureRequestData, userId: number): Observable<LectureRequestData> {
        return this.http.post<LectureRequestData>(API_URL + 'create/' + userId, lectureData);
    }

    updateLecture(lectureId: number, userId: number, lectureData: LectureRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + lectureId + '/' + userId, lectureData);
    }
}