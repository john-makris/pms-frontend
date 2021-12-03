import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ExcuseApplicationResponseData } from "./common/payload/response/excuseApplicationResponseData.interface";
import { ExcuseApplicationsResponseData } from "./common/payload/response/excuseApplicationsResponseData.interface";

const API_URL = 'http://localhost:8080/pms/excuse-applications/';

@Injectable({
    providedIn: 'root'
})
export class ExcuseApplicationService {

    excuseApplicationSubject = new BehaviorSubject<any | null>(null);

    excuseApplicationState = this.excuseApplicationSubject.asObservable();

    excuseApplicationTableLoadedSubject = new BehaviorSubject<boolean>(false);

    excuseApplicationTableLoadedState = this.excuseApplicationTableLoadedSubject.asObservable();

    identifierSuffixesSubject = new BehaviorSubject<Array<string>>([]);

    identifierSuffixesState = this.identifierSuffixesSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPageExcuseApplicationsByDepartmentId(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByDepartmentIdAndCourseScheduleId(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id_and_courseSchedule_Id/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByDepartmentIdCourseScheduleIdAndType(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id_courseSchedule_id_and_type/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByUserIdAndStatus(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_Id_and_status/paginated_sorted_filtered', { params });
    }
}