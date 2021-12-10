import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "src/app/common/models/pageDetail.model";
import { ClassSessionService } from "../../class-session.service";
import { ClassesSessionsResponseData } from "../payload/response/classesSessionsResponseData.interface";
import { ClassSessionResponseData } from "../payload/response/classSessionResponseData.interface";

export class ClassesSessionsDataSource implements DataSource<ClassSessionResponseData> {

    private classSessionSubject = new BehaviorSubject<ClassSessionResponseData[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private classSessionService: ClassSessionService) { }

    loadClassesSessions(
                lectureId: number,
                status: string,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        if (lectureId) {
            let params: HttpParams = this.createParams(lectureId, status,
                filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrieveData(params);
        } else {
            this.checkData(null);
        }

    }

    loadUserClassesSessions(
        status: boolean | null,
        userId: number,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string) {

        if (userId) {
            let params: HttpParams = this.createUserClassesSessionsParams(status, userId,
                filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrieveUserClassesSessions(params);
        } else {
            this.checkData(null);
        }

    }

    retrieveData(params: HttpParams) {
        if(!params.has('status')) {
            this.classSessionService.getAllPageClassesSessionsByLectureId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: ClassesSessionsResponseData) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        } else {
            this.classSessionService.getAllPageClassesSessionsByLectureIdAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: ClassesSessionsResponseData) => {
                console.log("RESPONSE B !!!!!!! "+response);
                this.checkData(response);
            });
        }
    }

    retrieveUserClassesSessions(params: HttpParams) {
        this.classSessionService.getAllPageClassesSessionsByUserIdAndStatus(params)
        .pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .pipe(first())
        .subscribe((response: ClassesSessionsResponseData) => {
            console.log("RESPONSE B !!!!!!! "+response);
            this.checkData(response);
        });
    }

    checkData(response: ClassesSessionsResponseData | null) {
        if(response!==null) {
            this.classSessionSubject.next(response.classesSessions);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.classesSessions.length);
            this.pageDetailSubject.next(pageDetail);
        } else {
            this.classSessionSubject.next([]);
            this.pageDetailSubject.next({
                currentPage: 0,
                totalItems: 0,
                totalPages: 0,
                currentPageItems: 0
            });
        }
    }

    createUserClassesSessionsParams(
        status: boolean | null,
        userId: number,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (status !== null) {
                params=params.set('status', status);
            }

            if (userId) {
                //console.log("User Id: "+userId);
                params=params.set('userId', userId);
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
        lectureId: number,
        status: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (lectureId) {
                //console.log("Lecture Id: "+lectureId);
                params=params.set('lectureId', lectureId);
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
        return this.classSessionSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.classSessionSubject.complete();
        this.loadingSubject.complete();
        this.pageDetailSubject.complete();
    }

}