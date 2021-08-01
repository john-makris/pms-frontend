import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Course } from "./course.model";

const API_URL = 'http://localhost:8080/pms/courses/';

export interface CourseRequestData {
    name: string,
    semester: string,
    department: {
        id: number;
    }
}

@Injectable({
    providedIn: 'root'
})
export class CourseService {

    constructor(private http: HttpClient) { }

    getAllCourses(params: HttpParams): Observable<any> {
        return this.http.get<Course[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllCoursesByDepartmentId(params: HttpParams): Observable<any> {
        return this.http.get<Course[]>(API_URL + 'per_department/all/paginated_sorted_filtered', { params });
    }

    getCourseById(courseId: number): Observable<Course> {
        return this.http.get<Course>(API_URL + courseId);
    }

    deleteAllCourses(): Observable<Course[]> {
        return this.http.delete<Course[]>(API_URL + 'delete/all')
    }

    deleteCourseById(courseId: number): Observable<Course> {
        return this.http.delete<Course>(API_URL + 'delete/' + courseId);
    }

    createCourse(courseData: CourseRequestData): Observable<Course> {
        return this.http.post<Course>(API_URL + 'create/', courseData);
    }

    updateCourse(courseId: number, courseData: CourseRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + courseId, courseData);
    }
}