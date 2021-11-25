import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "../../../common/models/pageDetail.model";
import { LectureService } from "../../lecture.service";
import { LectureResponseData } from "../payload/response/lectureResponseData.interface";
import { LecturesResponseData } from "../payload/response/lecturesResponseData.interface";

export class LecturesDataSource implements DataSource<LectureResponseData> {

    private lectureSubject = new BehaviorSubject<LectureResponseData[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private lectureService: LectureService) { }

    loadLectures(courseScheduleId: number,
                lectureTypeName: string,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        if (courseScheduleId) {
            let params: HttpParams = this.createParams(courseScheduleId, lectureTypeName,
                filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrieveData(params);
        } else {
            this.checkData(null);
        }

    }

    retrieveData(params: HttpParams) {
        this.lectureService.getAllPageLecturesByCourseScheduleIdPerType(params)
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

    checkData(response: LecturesResponseData | null) {
        if(response!==null) {
            this.lectureSubject.next(response.lectures);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.lectures.length);
            this.pageDetailSubject.next(pageDetail);
        } else {
            this.lectureSubject.next([]);
            this.pageDetailSubject.next({
                currentPage: 0,
                totalItems: 0,
                totalPages: 0,
                currentPageItems: 0
            });
        }
    }

    createParams(
        courseScheduleId: number,
        lectureTypeName: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (courseScheduleId) {
                //console.log("ID: "+courseScheduleId);
                params=params.set('courseScheduleId', courseScheduleId);
            }

            if (lectureTypeName) {
                //console.log("name: "+lectureType);
                params=params.set('name', lectureTypeName);
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
        return this.lectureSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.lectureSubject.complete();
        this.loadingSubject.complete();
        this.pageDetailSubject.complete();
    }

}