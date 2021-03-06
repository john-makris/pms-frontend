import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ManagePresencesRequestData } from "./common/payload/request/managePresencesRequestData.interface";
import { PresenceRequestData } from "./common/payload/request/presenceRequestData.interface";
import { PresenceResponseData } from "./common/payload/response/presenceResponseData.interface";
import { PresencesResponseData } from "./common/payload/response/presencesResponseData.interface";
import { Presence } from "./presence.model";

const API_URL = 'http://localhost:8080/pms/presences/';

@Injectable({
    providedIn: 'root'
})
export class PresenceService {

    presenceSubject = new BehaviorSubject<PresenceResponseData | null>(null);

    presenceState = this.presenceSubject.asObservable();

    presenceTableLoadedSubject = new BehaviorSubject<boolean>(false);

    presenceTableLoadedState = this.presenceTableLoadedSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPagePresences(params: HttpParams): Observable<any> {
        return this.http.get<PresencesResponseData[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllPagePresencesByClassSessionId(params: HttpParams): Observable<any> {
        return this.http.get<PresencesResponseData[]>(API_URL + 'all/by_class_session_id/paginated_sorted_filtered', { params });
    }

    getAllPagePresencesByClassSessionIdAndStatus(params: HttpParams): Observable<any> {
        return this.http.get<PresencesResponseData[]>(API_URL + 'all/by_class_session_id_and_status/paginated_sorted_filtered', { params });
    }

    getAllPagePresencesByClassSessionIdStatusAndExcuseStatus(params: HttpParams): Observable<any> {
        return this.http.get<PresencesResponseData[]>(API_URL + 'all/by_class_session_id_status_and_excuse_status/paginated_sorted_filtered', { params });
    }

    ///// Student

    getAllPagePresencesByUserIdPresenceStatusAndExcuseStatus(params: HttpParams): Observable<any> {
        return this.http.get<PresencesResponseData[]>(API_URL + 'all/by_user_id_status_and_excuse_status/paginated_sorted_filtered', { params });
    }
    
    getAllPagePresencesByUserIdCourseScheduleIdAndType(params: HttpParams): Observable<any> {
        return this.http.get<PresencesResponseData[]>(API_URL
            + 'all/by_user_id_courseSchedule_id_and_type/paginated_sorted_filtered', { params });
    }

    getAllPagePresencesByUserIdCourseScheduleIdTypeAndStatus(params: HttpParams): Observable<any> {
        return this.http.get<PresencesResponseData[]>(API_URL
            + 'all/by_user_id_courseSchedule_id_type_and_status/paginated_sorted_filtered', { params });
    }

    getAllPagePresencesByAllParameters(params: HttpParams): Observable<any> {
        return this.http.get<PresencesResponseData[]>(API_URL
            + 'all/by_user_id_courseSchedule_id_type_status_and_excuse_status/paginated_sorted_filtered', { params });
    }

    ///////////////////////////////////////////

    getAllPresences(): Observable<Presence[]> {
        return this.http.get<Presence[]>(API_URL + 'all');
    }

    getPresenceByClassSessionIdAndStudentId(classSessionId: number, studentId: number): Observable<PresenceResponseData> {
        return this.http.get<PresenceResponseData>(API_URL + classSessionId +'/' + studentId);
    }

    getPresenceById(presenceId: number, userId: number): Observable<PresenceResponseData> {
        return this.http.get<PresenceResponseData>(API_URL + presenceId + '/' + userId);
    }

    deleteAllPresences(): Observable<Presence[]> {
        return this.http.delete<Presence[]>(API_URL + 'delete/all');
    }

    deletePresenceById(presenceId: number): Observable<Presence> {
        return this.http.delete<Presence>(API_URL + 'delete/' + presenceId);
    }

    createPresence(presenceData: PresenceRequestData): Observable<PresenceRequestData> {
        return this.http.post<PresenceRequestData>(API_URL + 'create/', presenceData);
    }

    updatePresence(presenceId: number, userId: number, presenceData: PresenceRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + presenceId + '/' + userId + '/', presenceData);
    }

    createPresences(createPresencesRequestData: ManagePresencesRequestData, userId: number): Observable<ManagePresencesRequestData> {
        return this.http.post<ManagePresencesRequestData>(API_URL + 'create_presences/' + userId + '/', createPresencesRequestData);
    }

    updatePresences(createPresencesRequestData: ManagePresencesRequestData, userId: number): Observable<any> {
        return this.http.put(API_URL + 'update_presences/' + userId + '/', createPresencesRequestData);
    }

    updatePresenceStatus(presenceData: PresenceRequestData): Observable<any> {
        return this.http.put(API_URL + 'update_presence_status/', presenceData);
    }
}