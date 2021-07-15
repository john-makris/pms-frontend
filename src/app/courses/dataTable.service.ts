import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { CourseService } from './course.service';

@Injectable({ providedIn: 'root' })
export class DataTableService {
    public ensureDialogSubject = new Subject<boolean>();
    public ensureDialogState = this.ensureDialogSubject.asObservable();

    constructor(private courseService: CourseService) { }



}