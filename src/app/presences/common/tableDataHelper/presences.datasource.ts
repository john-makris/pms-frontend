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

    loadPresences(classSessionId: number,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        if (classSessionId) {
            let params: HttpParams = this.createParams(classSessionId,
                filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrieveData(params);
        } else {
            this.checkData(null);
        }

    }

    loadUserPresences(classSessionId: number,
        status: string,
        excuseStatus: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string) {

        if (classSessionId) {
            let params: HttpParams = this.createPresenceByUserParams(classSessionId,
                status, excuseStatus, filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrievePresenceDataByUser(params);
        } else {
            this.checkData(null);
        }

    }

    retrievePresenceDataByUser(params: HttpParams) {
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
    }

    retrieveData(params: HttpParams) {
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

    createPresenceByUserParams(
        userId: number,
        status: string,
        excuseStatus: string,
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
        classSessionId: number,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (classSessionId) {
                //console.log("ID: "+classSessionId);
                params=params.set('classSessionId', classSessionId);
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