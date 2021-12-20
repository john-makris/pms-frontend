import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ClassGroupResponseData } from "./common/payload/response/classGroupResponseData.interface";

const API_URL = 'http://localhost:8080/pms/classes-groups/';

@Injectable({
    providedIn: 'root'
})
export class ClassGroupService {

    classGroupSubject = new BehaviorSubject<ClassGroupResponseData | null>(null);

    classGroupState = this.classGroupSubject.asObservable();

    classGroupTableLoadedSubject = new BehaviorSubject<boolean>(false);

    classGroupTableLoadedState = this.classGroupTableLoadedSubject.asObservable();

    identifierSuffixesSubject = new BehaviorSubject<Array<string>>([]);

    identifierSuffixesState = this.identifierSuffixesSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPageClassesGroups(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllPageClassesGroupsByDepartmentId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_department/paginated_sorted_filtered', { params });
    }

    getAllPageClassesGroupsByCourseScheduleId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_courseSchedule/paginated_sorted_filtered', { params });
    }

    getAllPageClassesGroupsByDepartmentIdAndCourseScheduleId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_course-schedule_per_department/paginated_sorted_filtered', { params });
    }

    getAllPageClassesGroupsByCourseScheduleIdPerType(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_course-scheduleId_and_type/paginated_sorted_filtered', { params });
    }

    getAllPageClassesGroupsByCourseScheduleIdPerTypeAndStatus(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/_by_course_scheduleId_and_type_and_status/paginated_sorted_filtered', { params });
    }

    getAllClassesGroups(): Observable<any[]> {
        return this.http.get<any[]>(API_URL + 'all');
    }

    getClassGroupById(classGroupId: number, userId: number): Observable<ClassGroupResponseData> {
        return this.http.get<any>(API_URL + classGroupId + '/' +userId);
    }

    deleteAllClassesGroups(): Observable<any[]> {
        return this.http.delete<any[]>(API_URL + 'delete/all');
    }

    deleteClassGroupById(classGroupId: number, userId: number): Observable<any> {
        return this.http.delete<any>(API_URL + 'delete/' + classGroupId + '/' + userId);
    }

    createClassGroup(classGroupData: any, userId: number): Observable<any> {
        return this.http.post<any>(API_URL + 'create/' + userId, classGroupData);
    }

    updateClassGroup(classGroupId: number, userId: number, classGroupData: any): Observable<any> {
        return this.http.put(API_URL + 'update/' + classGroupId + '/' + userId, classGroupData);
    }
}