import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadFilesService {
  private baseUrl = 'http://localhost:8080/pms/users';

  constructor(private http: HttpClient) { }

  uploadStudents(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    console.log("File type ", file.name.endsWith('.csv'));
    if (file.name.endsWith('.csv')) {
      formData.append( 'file', new Blob([file], { type: 'text/csv' }), file.name);
    } else if (file.name.endsWith('.xlsx')) {
      formData.append( 'file', new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), file.name);
    } else {
      formData.append( 'file', new Blob([file], { type: file.type }), file.name);
    }
    const req = new HttpRequest('POST', `${this.baseUrl}/create_students`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
}