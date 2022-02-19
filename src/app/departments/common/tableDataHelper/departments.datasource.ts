import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "../../../common/models/pageDetail.model";
import { Department } from "../../department.model";
import { DepartmentService } from "../../department.service";
import { DepartmentsResponseData } from "../payload/response/departmentsResponseData.interface";

export class DepartmentsDataSource implements DataSource<Department> {

    private departmentSubject = new BehaviorSubject<Department[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private departmentService: DepartmentService) { }

    loadDepartments(schoolId: number,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        /*console.log("LOAD DEPARTMENTS PARAMETERS: ");
        console.log("SCHOOL ID: "+schoolId);
        console.log("FILTER: "+filter);
        console.log("Page Index: "+pageIndex);
        console.log("Page Size: "+pageSize);
        console.log("Sort Direction: "+sortDirection);
        console.log("Current Column Def: "+currentColumnDef);*/


        let params: HttpParams = this.createParams(schoolId,
            filter, pageIndex, pageSize, sortDirection, currentColumnDef);
            console.log("PARAMS: "+params);

        this.loadingSubject.next(true);

        this.retrieveData(params);
    }

    retrieveData(params: HttpParams) {
        if(!params.has('id')) {
            //console.log("EXIST ID ?"+ params.has('id'));
            this.departmentService.getAllPageDepartments(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: DepartmentsResponseData) => {
                //console.log("RESPONSE !!!!!!! "+response);
                this.checkData(response);
            });
        } else {
            //console.log("EXIST ID ?"+ params.has('id'));
            this.departmentService.getAllPageDepartmentsBySchoolId(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe((response: DepartmentsResponseData) => {
                //console.log("RESPONSE !!!!!!! "+response);
                this.checkData(response);
            });
        }
    }

    checkData(response: DepartmentsResponseData) {
        if(response!==null && response.departments) {
            this.departmentSubject.next(response.departments);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.departments.length);
            this.pageDetailSubject.next(pageDetail);
        } else {
            this.departmentSubject.next([]);
            this.pageDetailSubject.next({
                currentPage: 0,
                totalItems: 0,
                totalPages: 0,
                currentPageItems: 0
            });
        }
    }

    createParams(
        schoolId: number,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (schoolId) {
                //console.log("ID: "+schoolId);
                params=params.set('id', schoolId);
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
        return this.departmentSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.departmentSubject.complete();
        this.loadingSubject.complete();
        this.pageDetailSubject.complete();
    }

}