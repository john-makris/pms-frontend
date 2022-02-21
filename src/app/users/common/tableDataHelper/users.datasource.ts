import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { PageDetail } from "../../../common/models/pageDetail.model";
import { UserService } from "../../user.service";
import { UserPageResponseData } from "../payload/response/userPageResponseData.interface";
import { UserData } from "../payload/response/userData.interface";

export class UsersDataSource implements DataSource<UserData> {

    private userSubject = new BehaviorSubject<UserData[]>([]);

    private pageDetailSubject = new BehaviorSubject<PageDetail>({
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
        currentPageItems: 0
    });

    pageDetailState = this.pageDetailSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private userService: UserService) { }

    loadUsers(departmentId: number,
                roleName: string,
                filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        let params: HttpParams = this.createParams(departmentId, roleName, filter, 
            pageIndex, pageSize, sortDirection, currentColumnDef);
            console.log("PARAMS: "+params);

        this.loadingSubject.next(true);

        this.retrieveData(params);
    }

    loadCourseScheduleStudents(courseScheduleId: number,                
                    filter:string,
                    pageIndex:number,
                    pageSize:number,
                    sortDirection:string,
                    currentColumnDef:string) {
        let params: HttpParams = this.createCourseScheduleStudentParams(courseScheduleId, filter,
            pageIndex, pageSize, sortDirection, currentColumnDef);
            console.log("PARAMS: "+params);

        this.loadingSubject.next(true);

        this.retrieveCourseScheduleStudents(params);             
    }

    loadStudentsWithoutGroup(userId: number,
        courseScheduleId: number,
        classGroupTypeId: number,              
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string) {
        let params: HttpParams = this.createStudentWithoutGroupParams(userId, courseScheduleId, classGroupTypeId, filter,
        pageIndex, pageSize, sortDirection, currentColumnDef);
        console.log("PARAMS: "+params);

        this.loadingSubject.next(true);

        console.log("Course Schedule Id Param: "+courseScheduleId);
        console.log("Class Group Type Id: "+classGroupTypeId);

        this.retrieveStudentsWithoutGroup(params);
    }

    loadClassSessionStudents(userId: number,
        classSessionId: number,             
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string) {
        let params: HttpParams = this.createClassSessionStudentParams(userId, classSessionId, filter,
        pageIndex, pageSize, sortDirection, currentColumnDef);
        console.log("PARAMS: "+params);

        this.loadingSubject.next(true);

        console.log("Class Session Id Param: "+classSessionId);

        this.retrieveClassSessionStudents(params);
    }

    retrieveClassSessionStudents(params: HttpParams) {
        this.userService.getAllPageStudentsByClassSessionId(params)
        .pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .pipe(first())
        .subscribe((response: UserPageResponseData) => {
            //console.log("RESPONSE !!!!!!! "+response);
            this.checkData(response);
        });
    }

    retrieveStudentsWithoutGroup(params: HttpParams) {
        this.userService.getAllPageStudentsByCourseScheduleIdAndClassGroupTypeId(params)
        .pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .pipe(first())
        .subscribe((response: UserPageResponseData) => {
            //console.log("RESPONSE !!!!!!! "+response);
            this.checkData(response);
        });
    }

    retrieveCourseScheduleStudents(params: HttpParams) {
        this.userService.getAllPageStudentsByCourseSchedule(params)
        .pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .pipe(first())
        .subscribe((response: UserPageResponseData) => {
            //console.log("RESPONSE !!!!!!! "+response);
            this.checkData(response);
        });
    }

    retrieveData(params: HttpParams) {
        if(!params.has('id')) {
            if(params.has('name')) {
                this.userService.getAllPageUsersByRole(params)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => this.loadingSubject.next(false))
                )
                .pipe(first())
                .subscribe((response: UserPageResponseData) => {
                    //console.log("RESPONSE !!!!!!! "+response);
                    this.checkData(response);
                });
            } else {
                //console.log("EXIST ID ?"+ params.has('id'));
                this.userService.getAllPageUsers(params)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => this.loadingSubject.next(false))
                )
                .pipe(first())
                .subscribe((response: UserPageResponseData) => {
                    //console.log("RESPONSE !!!!!!! "+response);
                    this.checkData(response);
                });
            }
        } else {
            //console.log("EXIST ID ?"+ params.has('id'));
            if(params.has('name')) {
                this.userService.getAllPageUsersByDepartmentIdAndRole(params)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => this.loadingSubject.next(false))
                )
                .pipe(first())
                .subscribe((response: UserPageResponseData) => {
                    //console.log("RESPONSE !!!!!!! "+response);
                    this.checkData(response);
                });
            } else {
                this.userService.getAllPageUsersByDepartmentId(params)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => this.loadingSubject.next(false))
                )
                .pipe(first())
                .subscribe((response: UserPageResponseData) => {
                    //console.log("RESPONSE !!!!!!! "+response);
                    this.checkData(response);
                });
            }
        }
    }

    checkData(response: UserPageResponseData) {
        if(response!==null && response.users) {
           this.userSubject.next(response.users);
            console.log(response);
            const pageDetail: PageDetail = new PageDetail(
                response.currentPage,
                response.totalItems,
                response.totalPages,
                response.users.length);
            this.pageDetailSubject.next(pageDetail);
        } else {
            this.userSubject.next([]);
            this.pageDetailSubject.next({
                currentPage: 0,
                totalItems: 0,
                totalPages: 0,
                currentPageItems: 0
            });
        }
    }

    createClassSessionStudentParams(
        userId: number,
        classSessionId: number,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (userId) {
                console.log("userId: "+userId);
                params=params.set('userId', userId);
            }

            if (classSessionId) {
                console.log("classSessionId: "+classSessionId);
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

    createStudentWithoutGroupParams(
        userId: number,
        courseScheduleId: number,
        classGroupTypeId: number,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (userId) {
                console.log("userId: "+userId);
                params=params.set('userId', userId);
            }

            if (courseScheduleId) {
                console.log("courseScheduleId: "+courseScheduleId);
                params=params.set('courseScheduleId', courseScheduleId);
            }

            if (classGroupTypeId) {
                console.log("classGroupTypeId: "+classGroupTypeId);
                params=params.set('classGroupTypeId', classGroupTypeId);
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

    createCourseScheduleStudentParams(
        courseScheduleId: number,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (courseScheduleId) {
                //console.log("ID: "+courseScheduleId);
                params=params.set('id', courseScheduleId);
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
        roleName: string,
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (departmentId) {
                //console.log("ID: "+departmentId);
                params=params.set('id', departmentId);
            }
            
            if (roleName) {
                params=params.set('name', roleName);
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
        return this.userSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.userSubject.complete();
        this.loadingSubject.complete();
        this.pageDetailSubject.complete();
    }

}