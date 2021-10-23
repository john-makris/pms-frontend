import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Lecture } from "./lecture.model";

const API_URL = 'http://localhost:8080/pms/lectures/';

@Injectable({
    providedIn: 'root'
})
export class LectureService {

    lectureIdSubject = new BehaviorSubject<number>(0);

    lectureIdState = this.lectureIdSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPageLectures(params: HttpParams): Observable<any> {
        return this.http.get<Lecture[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllPageLecturesByCourseScheduleId(params: HttpParams): Observable<any> {
<<<<<<< HEAD
        return this.http.get<Lecture[]>(API_URL + 'all/by_course-schedule/paginated_sorted_filtered', { params });
=======
        return this.http.get<Lecture[]>(API_URL + 'per_school/all/paginated_sorted_filtered', { params });
>>>>>>> e5ebadd2a60946fd1bb42bfce482356c461e379b
    }

    getAllLectures(): Observable<Lecture[]> {
        return this.http.get<Lecture[]>(API_URL + 'all');
    }

    getLectureById(lectureId: number): Observable<Lecture> {
        return this.http.get<Lecture>(API_URL + lectureId);
    }

    deleteAllLectures(): Observable<Lecture[]> {
        return this.http.delete<Lecture[]>(API_URL + 'delete/all')
    }

    deleteLectureById(lectureId: number): Observable<Lecture> {
        return this.http.delete<Lecture>(API_URL + 'delete/' + lectureId);
    }

    createLecture(lectureData: any): Observable<Lecture> {
        return this.http.post<Lecture>(API_URL + 'create/', lectureData);
    }

    updateLecture(lectureId: number, lectureData: any): Observable<any> {
        return this.http.put(API_URL + 'update/' + lectureId, lectureData);
    }
}