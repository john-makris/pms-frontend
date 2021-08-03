import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { DepartmentRequestData } from "./common/payload/request/departmentRequestData.interface";
import { Department } from "./department.model";

const API_URL = 'http://localhost:8080/pms/departments/';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService {

    schoolIdSubject = new BehaviorSubject<number>(0);

    schoolIdState = this.schoolIdSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllPageDepartments(params: HttpParams): Observable<any> {
        return this.http.get<Department[]>(API_URL + 'all/paginated_sorted_filtered', { params });
    }

    getAllPageDepartmentsBySchoolId(params: HttpParams): Observable<any> {
        return this.http.get<Department[]>(API_URL + 'per_school/all/paginated_sorted_filtered', { params });
    }

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