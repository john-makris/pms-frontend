import { HttpClient, HttpEvent, HttpParams, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CourseScheduleRequestData } from "./common/payload/request/courseScheduleRequestData.interface";
import { CourseScheduleResponseData } from "./common/payload/response/courseScheduleResponseData.interface";
import { CourseSchedule } from "./course-schedule.model";

const API_URL = 'http://localhost:8080/pms/courses-schedules/';

@Injectable({
    providedIn: 'root'
})
export class CourseScheduleService {

    courseScheduleSubject = new BehaviorSubject<CourseSchedule | null>(null);

    courseScheduleState = this.courseScheduleSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPageCoursesSchedules(params: HttpParams): Observable<any> {
        return this.http.get<CourseSchedule[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllPageCoursesSchedulesByCourseDepartmentId(params: HttpParams): Observable<any> {
        return this.http.get<CourseSchedule[]>(API_URL + 'per_department/all/paginated_sorted_filtered', { params });
    }

    getAllCoursesSchedules(): Observable<CourseSchedule[]> {
        return this.http.get<CourseSchedule[]>(API_URL + 'all');
    }

    getCourseScheduleById(courseScheduleId: number): Observable<CourseScheduleResponseData> {
        return this.http.get<CourseSchedule>(API_URL + courseScheduleId);
    }

    getCourseScheduleByCourseId(courseId: number): Observable<CourseSchedule> {
        return this.http.get<CourseSchedule>(API_URL + 'course/' + courseId);
    }

    deleteAllCoursesSchedules(): Observable<CourseSchedule[]> {
        return this.http.delete<CourseSchedule[]>(API_URL + 'delete/all')
    }

    deleteCourseScheduleById(courseScheduleId: number): Observable<CourseSchedule> {
        return this.http.delete<CourseSchedule>(API_URL + 'delete/' + courseScheduleId);
    }

    createCourseSchedule(courseScheduleRequestData: CourseScheduleRequestData, 
        studentsFileData: File): Observable<HttpEvent<any>> {

        const formData: FormData = new FormData();

        if (studentsFileData.name.endsWith('.csv')) {
            formData.append( 'studentsFile', new Blob([studentsFileData], { type: 'text/csv' }), studentsFileData.name);
        }
        
        if (studentsFileData.name.endsWith('.xlsx')) {
            formData.append( 'studentsFile', new Blob([studentsFileData],
                { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), studentsFileData.name);
        }
        
        formData.append( 'courseScheduleRequestData', JSON.stringify(courseScheduleRequestData));

        console.log("Here is the problem: "+courseScheduleRequestData.course);

        console.log("Here is the problem: "+JSON.stringify(courseScheduleRequestData.course));

        const req = new HttpRequest('POST', `${API_URL}create`, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return this.http.request(req);
    }

    updateCourseSchedule(courseScheduleId: number, courseScheduleRequestData: CourseScheduleRequestData, 
        studentsFileData: File | null): Observable<HttpEvent<any>> {
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
        
        formData.append( 'courseScheduleRequestData', JSON.stringify(courseScheduleRequestData));

        const req = new HttpRequest('PUT', `${API_URL}update/` + courseScheduleId, formData, {
            reportProgress: true,
            responseType: 'json'
        });

        return this.http.request(req);
    }
}