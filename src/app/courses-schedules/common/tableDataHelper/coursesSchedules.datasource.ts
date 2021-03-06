import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "src/app/common/models/pageDetail.model";
import { CourseScheduleService } from "../../course-schedule.service";
import { CourseScheduleResponseData } from "../payload/response/courseScheduleResponseData.interface";
import { CoursesSchedulesResponseData } from "../payload/response/coursesSchedulesResponseData.interface";

export class CoursesSchedulesDataSource implements DataSource<CourseScheduleResponseData> {

    private courseScheduleSubject = new BehaviorSubject<CourseScheduleResponseData[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private courseScheduleService: CourseScheduleService) { }

    loadCoursesSchedules(
                userId: number,
                departmentId: number,
                status: string,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        /*console.log("LOAD COURSES SCHEDULES PARAMETERS: ");
        console.log("COURSE ID: "+courseId);
        console.log("FILTER: "+filter);
        console.log("Page Index: "+pageIndex);
        console.log("Page Size: "+pageSize);
        console.log("Sort Direction: "+sortDirection);
        console.log("Current Column Def: "+currentColumnDef);*/


        let params: HttpParams = this.createParams(userId, departmentId, status,
            filter, pageIndex, pageSize, sortDirection, currentColumnDef);
            console.log("PARAMS: "+params);

        this.loadingSubject.next(true);

        this.retrieveData(params);
    }

    retrieveData(params: HttpParams) {
        if(!params.has('id') && !params.has('status')) {
            //console.log("EXIST ID ?"+ params.has('id'));
            this.courseScheduleService.getAllPageCoursesSchedules(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: CoursesSchedulesResponseData) => {
                //console.log("RESPONSE !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('status')) {
            //console.log("EXIST ID ?"+ params.has('id'));
            this.courseScheduleService.getAllPageCoursesSchedulesByCourseDepartmentId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: CoursesSchedulesResponseData) => {
                //console.log("RESPONSE !!!!!!! "+response);
                this.checkData(response);
            });
        } else {
            this.courseScheduleService.getAllPageCoursesSchedulesByDepartmentIdAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: CoursesSchedulesResponseData) => {
                //console.log("RESPONSE !!!!!!! "+response);
                this.checkData(response);
            });
        }
    }

    checkData(response: CoursesSchedulesResponseData) {
        if(response!==null && response.coursesSchedules) {
            this.courseScheduleSubject.next(response.coursesSchedules);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.coursesSchedules.length);
            this.pageDetailSubject.next(pageDetail);
        } else {
            this.courseScheduleSubject.next([]);
            this.pageDetailSubject.next({
                currentPage: 0,
                totalItems: 0,
                totalPages: 0,
                currentPageItems: 0
            });
        }
    }

    createParams(
        userId: number,
        departmentId: number,
        status: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (userId) {
                //console.log("ID: "+userId);
                params=params.set('userId', userId);
            }

            if (departmentId) {
                //console.log("ID: "+courseId);
                params=params.set('id', departmentId);
            }

            if (status) {
                //console.log("Status: "+status);
                params=params.set('status', status);
            }

            if (filter) {
                //console.log("Filter: "+filter);
                params=params.set('filter', filter);
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
        return this.courseScheduleSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.courseScheduleSubject.complete();
        this.loadingSubject.complete();
        this.pageDetailSubject.complete();
    }

}