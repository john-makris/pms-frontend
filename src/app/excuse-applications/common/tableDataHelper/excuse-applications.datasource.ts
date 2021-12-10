import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "src/app/common/models/pageDetail.model";
import { ExcuseApplicationService } from "../../excuse-application.service";
import { ExcuseApplicationResponseData } from "../payload/response/excuseApplicationResponseData.interface";
import { ExcuseApplicationsResponseData } from "../payload/response/excuseApplicationsResponseData.interface";

export class ExcuseApplicationsDataSource implements DataSource<ExcuseApplicationResponseData> {

    private excuseApplicationSubject = new BehaviorSubject<ExcuseApplicationResponseData[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private excuseApplicationService: ExcuseApplicationService) { }

    loadDepartmentExcuseApplications(
                departmentId: number,
                courseScheduleId: number,
                lectureType: string,
                status: string,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        if (departmentId) {
            let params: HttpParams = this.createParams(departmentId, courseScheduleId, lectureType,
                status, filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrieveData(params);
        } else {
            this.checkData(null);
        }

    }

    loadUserExcuseApplications(
        userId: number,
        courseScheduleId: number,
        lectureType: string,
        status: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string) {

        if (userId) {
            let params: HttpParams = this.createUserExcuseApplicationParams(userId, courseScheduleId, lectureType,
                status, filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrieveUserExcuseApplications(params);
        } else {
            this.checkData(null);
        }

    }

    retrieveData(params: HttpParams) {
        if(!params.has('courseScheduleId') && !params.has('name') && !params.has('typeOfStatus')) {
            console.log("A");

            this.excuseApplicationService.getAllPageExcuseApplicationsByDepartmentId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('name') && !params.has('typeOfStatus')) {
            console.log("B");

            this.excuseApplicationService.getAllPageExcuseApplicationsByDepartmentIdAndCourseScheduleId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('courseScheduleId') && !params.has('typeOfStatus')) {
            console.log("C");

            this.excuseApplicationService.getAllPageExcuseApplicationsByDepartmentIdAndType(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('courseScheduleId') && !params.has('name')) {
            console.log("D");

            this.excuseApplicationService.getAllPageExcuseApplicationsByDepartmentIdAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('name')) {
            console.log("E");

            this.excuseApplicationService.getAllPageExcuseApplicationsByDepartmentIdCourseScheduleIdAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('typeOfStatus')) {
            console.log("F");

            this.excuseApplicationService.getAllPageExcuseApplicationsByDepartmentIdCourseScheduleIdAndType(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('courseScheduleId')) {
            console.log("G");

            this.excuseApplicationService.getAllPageExcuseApplicationsByDepartmentIdTypeAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else {
            console.log("H");

            this.excuseApplicationService.getAllPageExcuseApplicationsByAllParameters(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        }
    }

    retrieveUserExcuseApplications(params: HttpParams) {
        if(!params.has('courseScheduleId') && !params.has('name') && !params.has('typeOfStatus')) {
            console.log("A");

            this.excuseApplicationService.getAllPageExcuseApplicationsByUserId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('name') && !params.has('typeOfStatus')) {
            console.log("B");

            this.excuseApplicationService.getAllPageExcuseApplicationsByUserIdAndCourseScheduleId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('courseScheduleId') && !params.has('typeOfStatus')) {
            console.log("C");

            this.excuseApplicationService.getAllPageExcuseApplicationsByUserIdAndType(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('courseScheduleId') && !params.has('name')) {
            console.log("D");

            this.excuseApplicationService.getAllPageExcuseApplicationsByUserIdAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('name')) {
            console.log("E");

            this.excuseApplicationService.getAllPageExcuseApplicationsByUserIdCourseScheduleIdAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('typeOfStatus')) {
            console.log("F");

            this.excuseApplicationService.getAllPageExcuseApplicationsByUserIdCourseScheduleIdAndType(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else if (!params.has('courseScheduleId')) {
            console.log("G");

            this.excuseApplicationService.getAllPageExcuseApplicationsByUserIdTypeAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else {
            console.log("H");

            this.excuseApplicationService.getAllPageExcuseApplicationsForUserByAllParameters(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        }
    }

    checkData(response: ExcuseApplicationsResponseData | null) {
        if(response!==null) {
            this.excuseApplicationSubject.next(response.excuseApplications);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.excuseApplications.length);
            this.pageDetailSubject.next(pageDetail);
        } else {
            this.excuseApplicationSubject.next([]);
            this.pageDetailSubject.next({
                currentPage: 0,
                totalItems: 0,
                totalPages: 0,
                currentPageItems: 0
            });
        }
    }

    createUserExcuseApplicationParams(
        userId: number,
        courseScheduleId: number,
        lectureType: string,
        status: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (userId) {
                //console.log("User Id: "+userId);
                params=params.set('userId', userId);
            }

            if (courseScheduleId) {
                //console.log("CourseSchedule Id: "+courseScheduleId);
                params=params.set('courseScheduleId', courseScheduleId);
            }

            if (lectureType) {
                //console.log("Lecture Type Id: "+lectureType);
                params=params.set('name', lectureType);
            }

            if (status) {
                //console.log("Status: "+status);
                params=params.set('typeOfStatus', status);
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

    createParams(
        departmentId: number,
        courseScheduleId: number,
        lectureType: string,
        status: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (departmentId) {
                //console.log("Department Id: "+departmentId);
                params=params.set('departmentId', departmentId);
            }

            if (courseScheduleId) {
                //console.log("CourseSchedule Id: "+courseScheduleId);
                params=params.set('courseScheduleId', courseScheduleId);
            }

            if (lectureType) {
                //console.log("Lecture Type Id: "+lectureType);
                params=params.set('name', lectureType);
            }

            if (status) {
                //console.log("Status: "+status);
                params=params.set('typeOfStatus', status);
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
        return this.excuseApplicationSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.excuseApplicationSubject.complete();
        this.loadingSubject.complete();
        this.pageDetailSubject.complete();
    }

}