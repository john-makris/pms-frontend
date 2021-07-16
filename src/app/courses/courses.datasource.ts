import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { SnackbarData } from "../common/snackbars/snackbar-data.interface";
import { SnackbarService } from "../common/snackbars/snackbar.service";
import { Course } from "./course.model";
import { CourseService } from "./course.service";

export class CoursesDataSource implements DataSource<Course> {

    private responseSubject = new BehaviorSubject<Course[]>([]);

    private totalItemsSubject = new BehaviorSubject<number>(0);

    totalItemsState = this.totalItemsSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private courseService: CourseService,
        private snackbarService: SnackbarService) { }

    loadCourses(filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        let params = this.createParams(
            filter, pageIndex, pageSize, sortDirection, currentColumnDef);

        this.loadingSubject.next(true);

        this.retrieveData(params);

        this.snackbarService.snackbarState.subscribe(
            (state: SnackbarData) => {
              if(state.message.search('added' || 'updated' || 'deleted')) {
                console.log("Snackbar: " + state.message);
                this.retrieveData(params);
              }
            }
          );
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        console.log("Connecting data source");
        return this.responseSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.responseSubject.complete();
        this.loadingSubject.complete();
    }

    retrieveData(params: any) {
        this.courseService.getAllCourses(params)
        .pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .pipe(first())
        .subscribe(response => {
            this.checkData(response);
        });
    }

    checkData(response: any) {
        if(response!==null) {
            this.responseSubject.next(response.courses);
            this.totalItemsSubject.next(response.totalItems);
        } else {
            this.responseSubject.next([]);
            this.totalItemsSubject.next(0);
        }
    }

    createParams(filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): any {
            let params: any = {};

            if (filter) {
                params[`name`] = filter;
            }
    
            if (pageIndex) {
                params[`page`] = pageIndex;
            }
        
            if (pageSize) {
                params[`size`] = pageSize;
            }
        
            if (sortDirection && currentColumnDef) {
                params[`sort`] =  currentColumnDef+","+sortDirection;
            }
    }
}