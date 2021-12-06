import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ExcuseApplicationRequestData } from "./common/payload/request/excuseApplicationRequestData.interface";
import { ExcuseApplicationResponseData } from "./common/payload/response/excuseApplicationResponseData.interface";
import { ExcuseApplicationsResponseData } from "./common/payload/response/excuseApplicationsResponseData.interface";

const API_URL = 'http://localhost:8080/pms/excuse-applications/';

@Injectable({
    providedIn: 'root'
})
export class ExcuseApplicationService {

    excuseApplicationSubject = new BehaviorSubject<ExcuseApplicationResponseData | null>(null);

    excuseApplicationState = this.excuseApplicationSubject.asObservable();

    excuseApplicationTableLoadedSubject = new BehaviorSubject<boolean>(false);

    excuseApplicationTableLoadedState = this.excuseApplicationTableLoadedSubject.asObservable();

    identifierSuffixesSubject = new BehaviorSubject<Array<string>>([]);

    identifierSuffixesState = this.identifierSuffixesSubject.asObservable();

    constructor(private http: HttpClient) { }

    createExcuseApplication(excuseApplicationRequestData: ExcuseApplicationRequestData): Observable<ExcuseApplicationRequestData> {
        return this.http.post<ExcuseApplicationRequestData>(API_URL + 'create/', excuseApplicationRequestData);
    }

    updateExcuseApplication(excuseApplicationId: number, excuseApplicationRequestData: ExcuseApplicationRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + excuseApplicationId, excuseApplicationRequestData);
    }

    deleteExcuseApplicationById(excuseApplicationId: number): Observable<any> {
        return this.http.delete<any>(API_URL + 'delete/' + excuseApplicationId);
    }

    getExcuseApplicationById(excuseApplicationId: number): Observable<ExcuseApplicationResponseData> {
        return this.http.get<ExcuseApplicationResponseData>(API_URL + excuseApplicationId);
    }

    getAllPageExcuseApplicationsByDepartmentId(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByDepartmentIdAndCourseScheduleId(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id_and_courseSchedule_Id/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByDepartmentIdCourseScheduleIdAndType(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id_courseSchedule_id_and_type/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByDepartmentIdAndType(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id_and_type/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByDepartmentIdAndStatus(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id_and_status/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByDepartmentIdTypeAndStatus(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id_type_and_status/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByDepartmentIdCourseScheduleIdAndStatus(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_department_Id_courseSchedule_id_and_status/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByAllParameters(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_all_parameters/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByUserIdAndStatus(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_Id_and_status/paginated_sorted_filtered', { params });
    }
}