import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

const API_URL = 'http://localhost:8080/pms/excuse-applications/';

@Injectable({
    providedIn: 'root'
})
export class ExcuseApplicationService {

    excuseApplicationSubject = new BehaviorSubject<any | null>(null);

    excuseApplicationState = this.excuseApplicationSubject.asObservable();

    excuseApplicationTableLoadedSubject = new BehaviorSubject<boolean>(false);

    excuseApplicationTableLoadedState = this.excuseApplicationTableLoadedSubject.asObservable();

    identifierSuffixesSubject = new BehaviorSubject<Array<string>>([]);

    identifierSuffixesState = this.identifierSuffixesSubject.asObservable();

    constructor(private http: HttpClient) { }
}