import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

const API_URL = 'http://localhost:8080/pms/classes-groups/';

@Injectable({
    providedIn: 'root'
})
export class ClassGroupService {

    classGroupTableLoadedSubject = new BehaviorSubject<boolean>(false);

    classGroupTableLoadedState = this.classGroupTableLoadedSubject.asObservable();

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

    getAllPageClassesGroupsByDepartmentIdAndCourseScheduleIdPerType(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_course-scheduleId_and_type_per_department/paginated_sorted_filtered', { params });
    }

    getAllClassesGroups(): Observable<any[]> {
        return this.http.get<any[]>(API_URL + 'all');
    }

    getClassGroupById(classGroupId: number): Observable<any> {
        return this.http.get<any>(API_URL + classGroupId);
    }

    deleteAllClassesGroups(): Observable<any[]> {
        return this.http.delete<any[]>(API_URL + 'delete/all');
    }

    deleteClassGroupById(classGroupId: number): Observable<any> {
        return this.http.delete<any>(API_URL + 'delete/' + classGroupId);
    }

    createClassGroup(classGroupData: any): Observable<any> {
        return this.http.post<any>(API_URL + 'create/', classGroupData);
    }

    updateClassGroup(classGroupId: number, classGroupData: any): Observable<any> {
        return this.http.put(API_URL + 'update/' + classGroupId, classGroupData);
    }
}