import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { SchoolRequestData } from "./common/payload/request/schoolRequestData.interface";
import { School } from "./school.model";

const API_URL = 'http://localhost:8080/pms/schools/';

@Injectable({
    providedIn: 'root'
})
export class SchoolService {

    schoolIdSubject = new BehaviorSubject<number>(0);

    schoolIdState = this.schoolIdSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllSchools(): Observable<School[]> {
        return this.http.get<School[]>(API_URL + 'all');
    }

    getAllPageSchools(params: HttpParams): Observable<any> {
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