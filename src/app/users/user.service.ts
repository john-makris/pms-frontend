import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { UserPageResponseData } from "./common/payload/response/userPageResponseData.interface";
import { UserData } from "./common/payload/response/userData.interface";
import { User } from "./user.model";
import { UserResponseData } from "./common/payload/response/userResponseData.interface";
import { UserRequestData } from "./common/payload/request/userRequestData.interface";

const API_URL = 'http://localhost:8080/pms/users/';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    changeDepartmentSubject = new BehaviorSubject<boolean>(false);

    changeDepartmentState = this.changeDepartmentSubject.asObservable();

    departmentIdSubject = new BehaviorSubject<number>(0);

    departmentIdState = this.departmentIdSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(API_URL + 'all');
    }

    getAllPageUsers(params: HttpParams): Observable<any> {
        return this.http.get<UserPageResponseData>(API_URL + 'all/sorted', { params });
    }

    getAllPageUsersByDepartmentId(params: HttpParams): Observable<any> {
        return this.http.get<UserPageResponseData>(API_URL + 'per_department/all/paginated_sorted_filtered', { params });
    }

    getAllPageUsersByRole(params: HttpParams): Observable<any> {
        return this.http.get<UserPageResponseData>(API_URL + 'per_role/all/paginated_sorted_filtered', { params });
    }

    getAllPageUsersByDepartmentIdAndRole(params: HttpParams): Observable<any> {
        return this.http.get<UserPageResponseData>(API_URL + 'per_department_role/all/paginated_sorted_filtered', { params });
    }

    getUserById(userId: number): Observable<UserResponseData> {
        return this.http.get<UserResponseData>(API_URL + userId);
    }

    deleteAllUsers(): Observable<User[]> {
        return this.http.delete<User[]>(API_URL + 'delete/all');
    }

    deleteUserById(userId: number): Observable<User> {
        return this.http.delete<User>(API_URL + 'delete/' + userId);
    }

    createUser(userData: UserRequestData): Observable<UserRequestData> {
        return this.http.post<UserRequestData>(API_URL + 'create/', userData);
    }

    updateUser(userId: number, userData: UserRequestData): Observable<any> {
        return this.http.put(API_URL + 'update/' + userId, userData);
    }
}