import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CourseRequestData } from "./common/payload/request/courseRequestData.interface";
import { CourseResponseData } from "./common/payload/response/courseResponseData.interface";
import { Course } from "./course.model";

const API_URL = 'http://localhost:8080/pms/courses/';

@Injectable({
    providedIn: 'root'
})
export class CourseService {

    constructor(private http: HttpClient) { }

    getAllPageCourses(params: HttpParams): Observable<any> {
        return this.http.get<Course[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllPageCoursesPerSeason(params: HttpParams): Observable<any> {
        return this.http.get<Course[]>(API_URL + 'all/per_season_paginated_sorted_filtered', { params });
    }

    getAllPageCoursesByDepartmentIdPerSeason(params: HttpParams): Observable<any> {
        return this.http.get<Course[]>(API_URL + 'all/per_season_and_department/paginated_sorted_filtered', { params });
    }

    getAllPageCoursesByDepartmentId(params: HttpParams): Observable<any> {
        return this.http.get<Course[]>(API_URL + 'all/per_department/paginated_sorted_filtered', { params });
    }

    getAllCourses(): Observable<Course[]> {
        return this.http.get<Course[]>(API_URL + 'all');
    }

    getCourseById(courseId: number): Observable<CourseResponseData> {
        return this.http.get<CourseResponseData>(API_URL + courseId);
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