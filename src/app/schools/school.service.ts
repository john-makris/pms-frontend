import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { School } from "./school.model";

const API_URL = 'http://localhost:8080/pms/schools/';

export interface SchoolRequestData {
    name: string,
    location: string
}

@Injectable({
    providedIn: 'root'
})
export class SchoolService {

    constructor(private http: HttpClient) { }

    getAllSchools(params: HttpParams): Observable<any> {
        return this.http.get<School[]>(API_URL + 'all/sorted', { params });
    }

    getSchoolById(schoolId: number): Observable<School> {
        return this.http.get<School>(API_URL + schoolId);
    }

    deleteAllSchools(): Observable<School[]> {
        return this.http.delete<School[]>(API_URL + 'delete/all')
    }

    deleteSchoolById(schoolId: number): Observable<School> {
        return this.http.delete<School>(API_URL + 'delete/' + schoolId);
    }

    createSchool(schoolData: SchoolRequestData): Observable<School> {
        return this.http.post<School>(API_URL + 'create/', schoolData);
    }

    updateSchool(schoolId: number, schoolData: SchoolRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + schoolId, schoolData);
    }
}