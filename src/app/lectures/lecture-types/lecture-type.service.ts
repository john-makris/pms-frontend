import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { LectureType } from "./lecture-type.model";

const API_URL = '/api/pms/lecture-types/';

@Injectable({
    providedIn: 'root'
})
export class LectureTypeService {

    lectureTypeSubject = new BehaviorSubject<LectureType | null>(null);

    lectureTypeState = this.lectureTypeSubject.asObservable();

    constructor(private http: HttpClient) { }

    getAllLectureTypes(): Observable<LectureType[]> {
        return this.http.get<LectureType[]>(API_URL + 'all');
    }
}