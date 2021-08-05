import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ActiveCourse } from "./active-course.model";
import { ActiveCourseRequestData } from "./common/payload/request/activeCourseRequestData.interface";

const API_URL = 'http://localhost:8080/pms/active-courses/';

@Injectable({
    providedIn: 'root'
})
export class ActiveCourseService {

    courseIdSubject = new BehaviorSubject<number>(0);

    courseIdState = this.courseIdSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPageActiveCourses(params: HttpParams): Observable<any> {
        return this.http.get<ActiveCourse[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllPageActiveCoursesByCourseId(params: HttpParams): Observable<any> {
        return this.http.get<ActiveCourse[]>(API_URL + 'per_course/all/paginated_sorted_filtered', { params });
    }

    getAllActiveCourses(): Observable<ActiveCourse[]> {
        return this.http.get<ActiveCourse[]>(API_URL + 'all');
    }

    getActiveCourseById(activeCourseId: number): Observable<ActiveCourse> {
        return this.http.get<ActiveCourse>(API_URL + activeCourseId);
    }

    deleteAllActiveCourses(): Observable<ActiveCourse[]> {
        return this.http.delete<ActiveCourse[]>(API_URL + 'delete/all')
    }

    deleteActiveCourseById(activeCourseId: number): Observable<ActiveCourse> {
        return this.http.delete<ActiveCourse>(API_URL + 'delete/' + activeCourseId);
    }

    createActiveCourse(activeCourseData: ActiveCourseRequestData): Observable<ActiveCourse> {
        return this.http.post<ActiveCourse>(API_URL + 'create/', activeCourseData);
    }

    updateActiveCourse(activeCourseId: number, activeCourseData: ActiveCourseRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + activeCourseId, activeCourseData);
    }
}