import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

const API_URL = 'http://localhost:8080/pms/groups-students/';

@Injectable({
    providedIn: 'root'
})
export class GroupStudentService {

    groupStudentTableLoadedSubject = new BehaviorSubject<boolean>(false);

    groupStudentTableLoadedState = this.groupStudentTableLoadedSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPageGroupsOfStudents(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    /*
    getAllPageGroupsStudentsByDepartmentId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_department/paginated_sorted_filtered', { params });
    }

    getAllPageClassesGroupsByCourseScheduleId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_courseSchedule/paginated_sorted_filtered', { params });
    }

    getAllPageClassesGroupsByDepartmentIdAndCourseScheduleId(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_course-schedule_per_department/paginated_sorted_filtered', { params });
    }
    */
    getAllPageGroupsOfStudentsByDepartmentIdAndCourseScheduleIdPerTypeAndClassGroup(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/by_course-scheduleId_and_type_per_department/paginated_sorted_filtered', { params });
    }

    getStudentsOfGroup(params: HttpParams): Observable<any> {
        return this.http.get<any[]>(API_URL + 'all/students_of_group', { params });
    }

    getStudentOfGroup(studentId: number, classGroupId: number, userId: number): Observable<any> {
        return this.http.get<any[]>(API_URL + 'by_student_id_and_classGroup_id/' +studentId+ '/' +classGroupId + '/' + userId);
    }

    getAllGroupsOfStudents(): Observable<any[]> {
        return this.http.get<any[]>(API_URL + 'all');
    }

    getGroupStudentById(groupStudentId: number): Observable<any> {
        return this.http.get<any>(API_URL + groupStudentId);
    }

    getClassGroupByStudentIdAndCourseScheduleIdAndGroupType(studentId: number, courseScheduleId: number, type: string): Observable<any> {
        return this.http.get<any>(API_URL + 'by_student_id/' +studentId+ '/' +courseScheduleId+ '/' +type);
    }

    deleteAllGroupsStudents(): Observable<any[]> {
        return this.http.delete<any[]>(API_URL + 'delete/all');
    }

    deleteGroupStudentById(groupStudentId: number): Observable<any> {
        return this.http.delete<any>(API_URL + 'delete/' + groupStudentId);
    }

    deleteGroupStudentByClassGroupIdAndStudentId(classGroupId: number, studentId: number, userId: number): Observable<any> {
        return this.http.delete<any>(API_URL + 'delete/' + classGroupId + '/' + studentId + '/' + userId);
    }

    createGroupStudent(groupStudentData: any, userId: number): Observable<any> {
        return this.http.post<any>(API_URL + 'create/' + userId, groupStudentData);
    }

    updateGroupStudent(groupStudentId: number, groupStudentData: any): Observable<any> {
        return this.http.put(API_URL + 'update/' + groupStudentId, groupStudentData);
    }
}