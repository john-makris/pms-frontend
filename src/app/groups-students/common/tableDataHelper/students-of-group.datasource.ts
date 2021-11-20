import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "src/app/common/models/pageDetail.model";
import { GroupStudentService } from "../../group-student.service";
import { StudentOfGroupResponseData } from "../payload/response/studentOfGroupResponseData.interface";
import { StudentsOfGroupResponseData } from "../payload/response/studentsOfGroupResponseData.interface";

export class StudentsOfGroupDataSource implements DataSource<StudentOfGroupResponseData> {

    private studentsOfGroupSubject = new BehaviorSubject<StudentOfGroupResponseData[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private groupStudentService: GroupStudentService) { }

    loadStudentsOfGroup(
                classGroupId: number,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

            if (classGroupId) {
                let params: HttpParams = this.createParams(
                    classGroupId,
                    filter, 
                    pageIndex, 
                    pageSize, 
                    sortDirection, 
                    currentColumnDef);
                    console.log("PARAMS: "+params);
    
                this.loadingSubject.next(true);
    
                this.retrieveData(params);
            } else {
                this.checkData(null);
            }
    }

    retrieveData(params: HttpParams) {
        this.groupStudentService.getStudentsOfGroup(params)
        .pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .pipe(first())
        .subscribe((response: StudentsOfGroupResponseData) => {
            console.log("RESPONSE Students of Group !!!!!!! "+response);
            this.checkData(response);
        });
    }

    checkData(response: StudentsOfGroupResponseData | null) {
        if(response!==null) {
            this.studentsOfGroupSubject.next(response.studentsOfGroup);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.studentsOfGroup.length);
            this.pageDetailSubject.next(pageDetail);
        } else {
            this.studentsOfGroupSubject.next([]);
            this.pageDetailSubject.next({
                currentPage: 0,
                totalItems: 0,
                totalPages: 0,
                currentPageItems: 0
            });
        }
    }

    createParams(
        classGroupId: number,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (classGroupId) {
                //console.log("Class Group ID: "+classGroupId);
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
        return this.studentsOfGroupSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.studentsOfGroupSubject.complete();
        this.loadingSubject.complete();
        this.pageDetailSubject.complete();
    }

}