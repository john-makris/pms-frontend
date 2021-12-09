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

    getAllPagePresencesByUserIdPresenceStatusAndExcuseStatus(params: HttpParams): Observable<any> {
        return this.http.get<PresencesResponseData[]>(API_URL + 'all/by_user_id_status_and_excuse_status/paginated_sorted_filtered', { params });
    }

    getAllPresences(): Observable<Presence[]> {
        return this.http.get<Presence[]>(API_URL + 'all');
    }

    getPresenceByClassSessionIdAndStudentId(classSessionId: number, studentId: number): Observable<PresenceResponseData> {
        return this.http.get<PresenceResponseData>(API_URL + classSessionId +'/' + studentId);
    }

    getPresenceById(presenceId: number): Observable<PresenceResponseData> {
        return this.http.get<PresenceResponseData>(API_URL + presenceId);
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

    updatePresence(presenceId: number, presenceData: PresenceRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + presenceId, presenceData);
    }

    createPresences(createPresencesRequestData: ManagePresencesRequestData): Observable<ManagePresencesRequestData> {
        return this.http.post<ManagePresencesRequestData>(API_URL + 'create_presences/', createPresencesRequestData);
    }

    updatePresences(createPresencesRequestData: ManagePresencesRequestData): Observable<any> {
        return this.http.put(API_URL + 'update_presences/', createPresencesRequestData);
    }

    updatePresenceStatus(presenceData: PresenceRequestData): Observable<any> {
        return this.http.put(API_URL + 'update_presence_status/', presenceData);
    }
}