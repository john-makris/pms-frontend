import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Room } from "./room.model";

const API_URL = 'http://localhost:8080/pms/rooms/';

@Injectable({
    providedIn: 'root'
})
export class RoomService {

    constructor(private http: HttpClient) { }

    getAllRooms(): Observable<Room[]> {
        return this.http.get<Room[]>(API_URL + 'all');
    }
}