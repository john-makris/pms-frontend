import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Semester } from "./semester.model";

const API_URL = 'http://localhost:8080/pms/semesters/';

@Injectable({
    providedIn: 'root'
})
export class SemesterService {

    constructor(private http: HttpClient) { }

    getAllSemesters(): Observable<Semester[]> {
        return this.http.get<Semester[]>(API_URL + 'all');
    }
}