import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SchoolsDepartment } from "./schools-department.model";

const API_URL = 'http://localhost:8080/pms/schoolsDepartment/';

export interface SchoolsDepartmentRequestData {
    school: {
        id: number
    },
    department: {
        id: number
    }
}

@Injectable({
    providedIn: 'root'
})
export class SchoolsDepartmentService {

    constructor(private http: HttpClient) { }

    getAllSchoolsDepartments(): Observable<SchoolsDepartment[]> {
        return this.http.get<SchoolsDepartment[]>(API_URL + 'all');
    }

    getSchoolsDepartmentById(schoolsDepartmentId: number): Observable<SchoolsDepartment> {
        return this.http.get<SchoolsDepartment>(API_URL + schoolsDepartmentId);
    }

    getByDepartmentId(departmentId: number): Observable<SchoolsDepartment> {
        return this.http.get<SchoolsDepartment>(API_URL + 'department/' + departmentId);
    }

    deleteAllSchoolsDepartments(): Observable<SchoolsDepartment[]> {
        return this.http.delete<SchoolsDepartment[]>(API_URL + 'delete/all')
    }

    deleteSchoolsDepartmentById(schoolsDepartmentId: number): Observable<SchoolsDepartment> {
        return this.http.delete<SchoolsDepartment>(API_URL + 'delete/' + schoolsDepartmentId);
    }

    createSchoolsDepartment(schoolsDepartmentData: SchoolsDepartmentRequestData): Observable<SchoolsDepartment> {
        return this.http.post<SchoolsDepartment>(API_URL + 'create/', schoolsDepartmentData);
    }

    updateSchoolsDepartment(schoolsDepartmentId: number, schoolsDepartmentData: SchoolsDepartmentRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + schoolsDepartmentId, schoolsDepartmentData);
    }
}