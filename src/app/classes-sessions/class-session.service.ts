import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ClassSessionRequestData } from "./common/payload/request/classSessionRequestData.interface";
import { ClassSessionResponseData } from "./common/payload/response/classSessionResponseData.interface";

const API_URL = 'http://localhost:8080/pms/classes-sessions/';

@Injectable({
    providedIn: 'root'
})
export class ClassSessionService {

    classSessionSubject = new BehaviorSubject<ClassSessionResponseData | null>(null);

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

    getAllPageClassesSessionsByLectureId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_lecture_Id/paginated_sorted_filtered', { params });
    }

    getAllPageClassesSessionsByLectureIdAndStatus(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_lecture_Id_and_status/paginated_sorted_filtered', { params });
    }

    getAllPageClassesSessionsByUserIdAndStatus(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_user_Id_and_status/paginated_sorted_filtered', { params });
    }
    
    getAllClassesSessions(): Observable<any[]> {
        return this.http.get<any[]>(API_URL + 'all');
    }

    getClassSessionById(classSessionId: number, userId: number): Observable<ClassSessionResponseData> {
        return this.http.get<any>(API_URL + 'class_session/' + classSessionId + '/' + userId);
    }

    getClassSessionByLectureIdAndStudentId(lectureId: number, studentId: number): Observable<ClassSessionResponseData> {
        return this.http.get<any>(API_URL + lectureId + '/' + studentId);
    }

    getPresentedClassSessionByStudentIdAndStatus(studentId: number, status: boolean): Observable<ClassSessionResponseData> {
        return this.http.get<any>(API_URL + 'by_studentId_and_status/' + studentId + '/' + status);
    }

    deleteAllClassesSessions(): Observable<any[]> {
        return this.http.delete<any[]>(API_URL + 'delete/all');
    }

    deleteClassSessionById(classSessionId: number, userId: number): Observable<any> {
        return this.http.delete<any>(API_URL + 'delete/' + classSessionId + '/' + userId);
    }

    createClassSession(classSessionData: ClassSessionRequestData, userId: number): Observable<ClassSessionRequestData> {
        return this.http.post<any>(API_URL + 'create/' + userId, classSessionData);
    }

    updateClassSession(classSessionId: number, userId: number, classSessionData: ClassSessionRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + classSessionId + '/' + userId, classSessionData);
    }
}