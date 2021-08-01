import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { HttpParams } from "@angular/common/http";
import {Observable, BehaviorSubject, of} from "rxjs";
import {catchError, finalize, first} from "rxjs/operators";
import { SnackbarData } from "../common/snackbars/snackbar-data.interface";
import { SnackbarService } from "../common/snackbars/snackbar.service";
import { School } from "./school.model";
import { SchoolService } from "./school.service";

export class SchoolsDataSource implements DataSource<School> {

    private responseSubject = new BehaviorSubject<School[]>([]);

    private totalItemsSubject = new BehaviorSubject<number>(0);

    totalItemsState = this.totalItemsSubject.asObservable();

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

    constructor(private schoolService: SchoolService,
        private snackbarService: SnackbarService) { }

    loadSchools(filter:string,
                pageIndex:number,
                pageSize:number,
                sortDirection:string,
                currentColumnDef:string) {

        let params = this.createParams(filter, pageIndex, pageSize, sortDirection, currentColumnDef);
            console.log("PARAMS: "+params);

        this.loadingSubject.next(true);

        this.retrieveData(params);

        this.snackbarService.snackbarState.subscribe(
            (state: SnackbarData) => {
              if(state.message.search('added' || 'updated' || 'deleted')) {
                console.log("Snackbar: " + state.message);
                this.retrieveData(params);
              }
            }
          );
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        console.log("Connecting data source");
        return this.responseSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.responseSubject.complete();
        this.loadingSubject.complete();
    }

    retrieveData(params: HttpParams) {
            this.schoolService.getAllSchools(params)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .pipe(first())
            .subscribe(response => {
                console.log("RESPONSE: "+response.schools.length);
                this.checkData(response);
            });
    }

    checkData(response: any) {
        if(response!==null) {
            this.responseSubject.next(response.schools);
            this.totalItemsSubject.next(response.totalItems);
        } else {
            this.responseSubject.next([]);
            this.totalItemsSubject.next(0);
        }
    }

    createParams(
        filter:string,
        pageIndex:number,
        pageSize:number,
        sortDirection:string,
        currentColumnDef:string): HttpParams {

            let params = new HttpParams();

            if (filter) {
                console.log("Filter: "+filter);
                params=params.set('name', filter);
            }
    
            if (pageIndex) {
                console.log("pageIndex: "+pageIndex);
                params=params.set('page', pageIndex);
            }
        
            if (pageSize) {
                console.log("pageSize: "+pageSize);
                params=params.set('size', pageSize);
            }
        
            if (sortDirection && currentColumnDef) {
                params=params.set('sort', currentColumnDef+","+sortDirection);
                console.log("SORT: "+currentColumnDef+","+sortDirection);
            }
        return params;
    }
}