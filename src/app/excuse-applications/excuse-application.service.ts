import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { UserResponseData } from "../users/common/payload/response/userResponseData.interface";
import { ExcuseApplicationRequestData } from "./common/payload/request/excuseApplicationRequestData.interface";
import { ExcuseApplicationResponseData } from "./common/payload/response/excuseApplicationResponseData.interface";
import { ExcuseApplicationsResponseData } from "./common/payload/response/excuseApplicationsResponseData.interface";

const API_URL = 'http://localhost:8080/pms/excuse-applications/';

@Injectable({
    providedIn: 'root'
})
export class ExcuseApplicationService {

    styleIndexSubject = new BehaviorSubject<number>(-1);

    excuseApplicationSubject = new BehaviorSubject<ExcuseApplicationResponseData | null>(null);

    excuseApplicationState = this.excuseApplicationSubject.asObservable();

    excuseApplicationTableLoadedSubject = new BehaviorSubject<boolean>(false);

    excuseApplicationTableLoadedState = this.excuseApplicationTableLoadedSubject.asObservable();

    identifierSuffixesSubject = new BehaviorSubject<Array<string>>([]);

    identifierSuffixesState = this.identifierSuffixesSubject.asObservable();

    constructor(private http: HttpClient) { }

    createExcuseApplication(excuseApplicationRequestData: ExcuseApplicationRequestData, userId: number): Observable<ExcuseApplicationRequestData> {
        return this.http.post<ExcuseApplicationRequestData>(API_URL + 'create/' + userId + '/', excuseApplicationRequestData);
    }

    updateExcuseApplication(excuseApplicationId: number, userId: number, excuseApplicationRequestData: ExcuseApplicationRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + userId + '/' + excuseApplicationId + '/', excuseApplicationRequestData);
    }

    deleteExcuseApplicationById(excuseApplicationId: number): Observable<any> {
        return this.http.delete<any>(API_URL + 'delete/' + excuseApplicationId);
    }

    getExcuseApplicationById(excuseApplicationId: number, userId: number): Observable<ExcuseApplicationResponseData> {
        return this.http.get<ExcuseApplicationResponseData>(API_URL + excuseApplicationId + '/' + userId);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getAllPageExcuseApplicationsByUserIdAndStatus(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_Id_and_status/paginated_sorted_filtered', { params });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    getAllPageExcuseApplicationsByUserId(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_Id/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByUserIdAndCourseScheduleId(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_Id_and_courseSchedule_Id/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByUserIdAndType(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_Id_and_type/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByUserIdCourseScheduleIdAndStatus(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_Id_courseSchedule_id_and_status/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByUserIdCourseScheduleIdAndType(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_Id_courseSchedule_id_and_type/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsByUserIdTypeAndStatus(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_Id_type_and_status/paginated_sorted_filtered', { params });
    }

    getAllPageExcuseApplicationsForUserByAllParameters(params: HttpParams): Observable<ExcuseApplicationsResponseData> {
        return this.http.get<ExcuseApplicationsResponseData>(API_URL + 'all/by_user_and_all_parameters/paginated_sorted_filtered', { params });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}