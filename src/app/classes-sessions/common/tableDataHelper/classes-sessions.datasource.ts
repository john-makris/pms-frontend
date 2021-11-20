import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "src/app/common/models/pageDetail.model";
import { ClassSessionService } from "../../class-session.service";

export class ClassesGroupsDataSource implements DataSource<any> {

    private classSessionSubject = new BehaviorSubject<any[]>([]);

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
                classGroupId: string,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        if (lectureId && classGroupId) {
            let params: HttpParams = this.createParams(lectureId, classGroupId,
                filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrieveData(params);
        } else {
            this.checkData(null);
        }

    }

    retrieveData(params: HttpParams) {
        this.classSessionService.getAllPageClassesSessionsByLectureIdAndClassGroupId(params)
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

    checkData(response: any | null) {
        if(response!==null) {
            this.classSessionSubject.next(response.classesGroups);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.classesGroups.length);
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

    createParams(
        lectureId: number,
        classGroupId: string,
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

            if (classGroupId) {
                //console.log("Class Group Id: "+classGroupId);
                params=params.set('classGroupId', classGroupId);
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