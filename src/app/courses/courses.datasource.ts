import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { Course } from "./course.model";
import { CourseService } from "./course.service";
import { PageDetail } from "./pageDetail.model";

export class CoursesDataSource implements DataSource<Course> {

    private courseSubject = new BehaviorSubject<Course[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private courseService: CourseService) { }

    loadCourses(departmentId: number,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        /*console.log("LOAD COURSES PARAMETERS: ");
        console.log("DEPARTMENT ID: "+departmentId);
        console.log("FILTER: "+filter);
        console.log("Page Index: "+pageIndex);
        console.log("Page Size: "+pageSize);
        console.log("Sort Direction: "+sortDirection);
        console.log("Current Column Def: "+currentColumnDef);*/


        let params = this.createParams(departmentId,
            filter, pageIndex, pageSize, sortDirection, currentColumnDef);
            console.log("PARAMS: "+params);

        this.loadingSubject.next(true);

        this.retrieveData(params);
    }

    retrieveData(params: HttpParams) {
        if(!params.has('id')) {
            //console.log("EXIST ID ?"+ params.has('id'));
            this.courseService.getAllCourses(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe(response => {
                //console.log("RESPONSE !!!!!!! "+response);
                this.checkData(response);
            });
        } else {
            //console.log("EXIST ID ?"+ params.has('id'));
            this.courseService.getAllCoursesByDepartmentId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe(response => {
                //console.log("RESPONSE !!!!!!! "+response);
                this.checkData(response);
            });
        }
    }

    checkData(response: any) {
        if(response!==null) {
            this.courseSubject.next(response.courses);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.courses.length);
            this.pageDetailSubject.next(pageDetail);
        } else {
            this.courseSubject.next([]);
            this.pageDetailSubject.next({
                currentPage: 0,
                totalItems: 0,
                totalPages: 0,
                currentPageItems: 0
            });
        }
    }

    createParams(
        departmentId: number,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (departmentId) {
                //console.log("ID: "+departmentId);
                params=params.set('id', departmentId);
            }

            if (filter) {
                //console.log("Filter: "+filter);
                params=params.set('name', filter);
            }
    
            if (pageIndex) {
                //console.log("pageIndex: "+pageIndex);
                params=params.set('page', pageIndex);
            }
        
            if (pageSize) {
                //console.log("pageSize: "+pageSize);
                params=params.set('size', pageSize);
            }
        
            if (sortDirection && currentColumnDef) {
                params=params.set('sort', currentColumnDef+","+sortDirection);
                //console.log("SORT: "+currentColumnDef+","+sortDirection);
            }
        return params;
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        console.log("Connecting data source");
        return this.courseSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.courseSubject.complete();
        this.loadingSubject.complete();
        this.pageDetailSubject.complete();
    }


}