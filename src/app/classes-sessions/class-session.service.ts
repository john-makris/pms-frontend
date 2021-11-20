import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

const API_URL = 'http://localhost:8080/pms/classes-sessions/';

@Injectable({
    providedIn: 'root'
})
export class ClassSessionService {

    classSessionSubject = new BehaviorSubject<any | null>(null);

    classSessionState = this.classSessionSubject.asObservable();

    classSessionTableLoadedSubject = new BehaviorSubject<boolean>(false);

    classSessionTableLoadedState = this.classSessionTableLoadedSubject.asObservable();

    identifierSuffixesSubject = new BehaviorSubject<Array<string>>([]);

    identifierSuffixesState = this.identifierSuffixesSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPageClassesSessions(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllPageClassesSessionsByDepartmentId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_department/paginated_sorted_filtered', { params });
    }

    getAllPageClassesSessionsByCourseScheduleId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_courseSchedule/paginated_sorted_filtered', { params });
    }

    getAllPageClassesSessionsByDepartmentIdAndCourseScheduleId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_course-schedule_per_department/paginated_sorted_filtered', { params });
    }

    getAllPageClassesSessionsByLectureIdAndClassGroupId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_lecture_Id_and_class_group_Id/paginated_sorted_filtered', { params });
    }

    getAllClassesSessions(): Observable<any[]> {
        return this.http.get<any[]>(API_URL + 'all');
    }

    getClassSessionById(classSessionId: number): Observable<any> {
        return this.http.get<any>(API_URL + classSessionId);
    }

    deleteAllClassesSessions(): Observable<any[]> {
        return this.http.delete<any[]>(API_URL + 'delete/all');
    }

    deleteClassSessionById(classSessionId: number): Observable<any> {
        return this.http.delete<any>(API_URL + 'delete/' + classSessionId);
    }

    createClassSession(classSessionData: any): Observable<any> {
        return this.http.post<any>(API_URL + 'create/', classSessionData);
    }

    updateClassSession(classSessionId: number, classSessionData: any): Observable<any> {
        return this.http.put(API_URL + 'update/' + classSessionId, classSessionData);
    }
}