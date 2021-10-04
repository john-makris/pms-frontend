import { HttpClient, HttpEvent, HttpParams, HttpRequest } from "@angular/common/http";
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

    getAllPageActiveCoursesByCourseDepartmentId(params: HttpParams): Observable<any> {
        return this.http.get<ActiveCourse[]>(API_URL + 'per_department/all/paginated_sorted_filtered', { params });
    }

    getAllActiveCourses(): Observable<ActiveCourse[]> {
        return this.http.get<ActiveCourse[]>(API_URL + 'all');
    }

    getActiveCourseById(activeCourseId: number): Observable<ActiveCourse> {
        return this.http.get<ActiveCourse>(API_URL + activeCourseId);
    }

    getActiveCourseByCourseId(courseId: number): Observable<ActiveCourse> {
        return this.http.get<ActiveCourse>(API_URL + 'course/' + courseId);
    }

    deleteAllActiveCourses(): Observable<ActiveCourse[]> {
        return this.http.delete<ActiveCourse[]>(API_URL + 'delete/all')
    }

    deleteActiveCourseById(activeCourseId: number): Observable<ActiveCourse> {
        return this.http.delete<ActiveCourse>(API_URL + 'delete/' + activeCourseId);
    }

    createActiveCourse(activeCourseData: ActiveCourseRequestData, studentsFileData: File): Observable<HttpEvent<any>> {
        const formData: FormData = new FormData();

        if (studentsFileData.name.endsWith('.csv')) {
            formData.append( 'studentsFile', new Blob([studentsFileData], { type: 'text/csv' }), studentsFileData.name);
        }
        
        if (studentsFileData.name.endsWith('.xlsx')) {
            formData.append( 'studentsFile', new Blob([studentsFileData],
                { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), studentsFileData.name);
        }
        
        formData.append( 'activeCourseData', JSON.stringify(activeCourseData));

        const req = new HttpRequest('POST', `${API_URL}create`, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return this.http.request(req);
    }

    updateActiveCourse(activeCourseId: number, activeCourseData: ActiveCourseRequestData, studentsFileData: File | null): Observable<HttpEvent<any>> {
        const formData: FormData = new FormData();

        if (studentsFileData) {
            if (studentsFileData.name.endsWith('.csv')) {
                formData.append( 'studentsFile', new Blob([studentsFileData], { type: 'text/csv' }), studentsFileData.name);
            }
            
            if (studentsFileData.name.endsWith('.xlsx')) {
                formData.append( 'studentsFile', new Blob([studentsFileData],
                    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), studentsFileData.name);
            }
        }
        
        formData.append( 'activeCourseData', JSON.stringify(activeCourseData));

        const req = new HttpRequest('PUT', `${API_URL}update/` + activeCourseId, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return this.http.request(req);
    }
}