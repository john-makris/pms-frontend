import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Department } from "./department.model";

const API_URL = 'http://localhost:8080/pms/departments/';

export interface DepartmentRequestData {
    name: string
}

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {

    constructor(private http: HttpClient) { }

    getAllDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(API_URL + 'all');
    }

    getDepartmentById(departmentId: number): Observable<Department> {
        return this.http.get<Department>(API_URL + departmentId);
    }

    deleteAllDepartments(): Observable<Department[]> {
        return this.http.delete<Department[]>(API_URL + 'delete/all')
    }

    deleteDepartmentById(departmentId: number): Observable<Department> {
        return this.http.delete<Department>(API_URL + 'delete/' + departmentId);
    }

    createDepartment(departmentData: DepartmentRequestData): Observable<Department> {
        return this.http.post<Department>(API_URL + 'create/', departmentData);
    }

    updateDepartment(departmentId: number, departmentData: DepartmentRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + departmentId, departmentData);
    }
}