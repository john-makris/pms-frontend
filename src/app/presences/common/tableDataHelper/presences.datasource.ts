import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "../../../common/models/pageDetail.model";
import { PresenceService } from "../../presence.service";
import { PresenceResponseData } from "../payload/response/presenceResponseData.interface";
import { PresencesResponseData } from "../payload/response/presencesResponseData.interface";

export class PresencesDataSource implements DataSource<PresenceResponseData> {

    private presenceSubject = new BehaviorSubject<PresenceResponseData[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private presenceService: PresenceService) { }

    loadPresences(userId: number,
                classSessionId: number,
                status: string,
                excuseStatus: string,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        if (classSessionId) {
            let params: HttpParams = this.createParams(userId, classSessionId, status, excuseStatus,
                filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrieveData(params);
        } else {
            this.checkData(null);
        }

    }

    loadUserPresences(
        currentUserId: number,
        userId: number,
        courseScheduleId: number,
        lectureType: string,
        status: string,
        excuseStatus: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string) {

        if (userId) {
            let params: HttpParams = this.createPresenceByUserParams(currentUserId, userId,
                courseScheduleId, lectureType, status, excuseStatus, filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrievePresenceDataByUser(params);
        } else {
            this.checkData(null);
        }

    }

    retrievePresenceDataByUser(params: HttpParams) {
        if (!params.has('courseSchedule') && !params.has('lectureType')) {
            console.log("Simple Search !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            this.presenceService.getAllPagePresencesByUserIdPresenceStatusAndExcuseStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE !!!!!!! "+JSON.stringify(response)+" You call me !");
                this.checkData(response);
            });
        } else if(!params.has('typeOfStatus') && !params.has('excuseStatus')) {
            console.log("Simple Search Course Schedule Id and Type");
            this.presenceService.getAllPagePresencesByUserIdCourseScheduleIdAndType(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE !!!!!!! "+JSON.stringify(response)+" You call me !");
                this.checkData(response);
            });
        } else if (!params.has('excuseStatus')) {
            console.log("Simple Search Course Schedule Id and Type and Status");
            this.presenceService.getAllPagePresencesByUserIdCourseScheduleIdTypeAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE !!!!!!! "+JSON.stringify(response)+" You call me !");
                this.checkData(response);
            });
        } else {
            this.presenceService.getAllPagePresencesByAllParameters(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE !!!!!!! "+JSON.stringify(response)+" You call me !");
                this.checkData(response);
            });
        }
    }

    retrieveData(params: HttpParams) {
        if(!params.has('status') && !params.has('excuseStatus')) {
            this.presenceService.getAllPagePresencesByClassSessionId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE !!!!!!! "+JSON.stringify(response)+" You call me !");
                this.checkData(response);
            });
        } else if (!params.has('excuseStatus')) {
            this.presenceService.getAllPagePresencesByClassSessionIdAndStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE !!!!!!! "+JSON.stringify(response)+" You call me !");
                this.checkData(response);
            });
        } else {
            this.presenceService.getAllPagePresencesByClassSessionIdStatusAndExcuseStatus(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                console.log("RESPONSE !!!!!!! "+JSON.stringify(response)+" You call me !");
                this.checkData(response);
            });
        }

    }

    checkData(response: PresencesResponseData | null) {
        if(response!==null) {
            this.presenceSubject.next(response.presences);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.presences.length);
            this.pageDetailSubject.next(pageDetail);
        } else {
            this.presenceSubject.next([]);
            this.pageDetailSubject.next({
                currentPage: 0,
                totalItems: 0,
                totalPages: 0,
                currentPageItems: 0
            });
        }
    }

    createPresenceByUserParams(currentUserId: number,
        userId: number,
        courseScheduleId: number,
        lectureType: string,
        status: string,
        excuseStatus: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (currentUserId) {
                //console.log("Current User Id: "+currentUserId);
                params=params.set('currentUserId', currentUserId);
            }

            if (userId) {
                //console.log("ID: "+userId);
                params=params.set('userId', userId);
            }

            if (courseScheduleId) {
                //console.log("Course Schedule Id: "+courseScheduleId);
                params=params.set('courseScheduleId', courseScheduleId);
            }

            if (lectureType) {
                //console.log("Lecture Type: "+lectureType);
                params=params.set('lectureType', lectureType);
            }

            if (status) {
                //console.log("Status: "+status);
                params=params.set('typeOfStatus', status);
            }

            if (excuseStatus) {
                //console.log("Excuse Status: "+excuseStatus);
                params=params.set('excuseStatus', excuseStatus);
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
        userId: number,
        classSessionId: number,
        status: string,
        excuseStatus: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (userId) {
                //console.log("userId: "+userId);
                params=params.set('userId', userId);
            }

            if (classSessionId) {
                //console.log("classSessionId: "+classSessionId);
                params=params.set('classSessionId', classSessionId);
            }

            if (status) {
                //console.log("status: "+status);
                params=params.set('status', status);
            }

            if (excuseStatus) {
                //console.log("excuseStatus: "+excuseStatus);
                params=params.set('excuseStatus', excuseStatus);
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
        return this.presenceSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.presenceSubject.complete();
        this.loadingSubject.complete();
        this.pageDetailSubject.complete();
    }

}