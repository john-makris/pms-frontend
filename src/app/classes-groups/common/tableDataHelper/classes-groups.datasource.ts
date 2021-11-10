import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "src/app/common/models/pageDetail.model";
import { ClassGroupService } from "../../class-group.service";
import { ClassesGroupsResponseData } from "../payload/response/classesGroupsResponseData.interface";
import { ClassGroupResponseData } from "../payload/response/classGroupResponseData.interface";

export class ClassesGroupsDataSource implements DataSource<ClassGroupResponseData> {

    private lectureSubject = new BehaviorSubject<ClassGroupResponseData[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private classGroupService: ClassGroupService) { }

    loadClassesGroups(departmentId: number,
                courseScheduleId: number,
                lectureTypeName: string,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        if (departmentId && courseScheduleId) {
            let params: HttpParams = this.createParams(departmentId, courseScheduleId, lectureTypeName,
                filter, pageIndex, pageSize, sortDirection, currentColumnDef);
                console.log("PARAMS: "+params);

            this.loadingSubject.next(true);

            this.retrieveData(params);
        } else {
            this.checkData(null);
        }

    }

    retrieveData(params: HttpParams) {
        if (!params.has('name')) {
            this.classGroupService.getAllPageClassesGroupsByDepartmentIdAndCourseScheduleId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                //console.log("RESPONSE !!!!!!! "+response);
                this.checkData(response);
            });
        } else {
            this.classGroupService.getAllPageClassesGroupsByDepartmentIdAndCourseScheduleIdPerType(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: any) => {
                //console.log("RESPONSE !!!!!!! "+response);
                this.checkData(response);
            });
        }

    }

    checkData(response: ClassesGroupsResponseData | null) {
        if(response!==null) {
            this.lectureSubject.next(response.classesGroups);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.classesGroups.length);
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
        departmentId: number,
        courseScheduleId: number,
        lectureTypeName: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (departmentId) {
                //console.log("ID: "+departmentId);
                params=params.set('departmentId', departmentId);
            }

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