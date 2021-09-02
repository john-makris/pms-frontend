import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import { PageDetail } from 'src/app/common/models/pageDetail.model';
import { SnackbarData } from 'src/app/common/snackbars/snackbar-data.interface';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { UsersDataSource } from '../common/tableDataHelper/users.datasource';
import { Role } from '../role.model';
import { RoleService } from '../role.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

    selectDepartmentForm!: FormGroup;
    hideRequiredControl = new FormControl(false);
    floatLabelControl = new FormControl('auto');

    selectRoleForm!: FormGroup;
    roles: Role[] = [];
    selectedRoleName: string = '';

    isLoading: boolean = false;
    submitted: boolean = false;
    delimeter: string = ',' + '\xa0';
    
    dataSource!: UsersDataSource;

    departments!: Department[];
    selectedDepartmentId: number = 0;
    changedDepartmentId: number = 0;
  
    totalItems: number = 0;
    currentPage: number = 0;
    currentPageItems: number = 0;
    currentColumnDef: string = 'id';
    currentActivityState: string = '';
  
    snackbarSubscription!: Subscription;
    pageDetailSubscription!: Subscription;
    departmentsSubscription!: Subscription;
    departmentIdSubscription!: Subscription;
    departmentChangeStatusSubscription!: Subscription;
    rolesSubscription!: Subscription;

    departmentChangeStatus: boolean = false;
  
    displayedColumns = [
      'id',
      'username',
      'roles'
    ];
  
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('input') input!: ElementRef;
  
    constructor(
      private router: Router,
      private route: ActivatedRoute,
      private formBuilder: FormBuilder,
      private userService: UserService,
      private snackbarService: SnackbarService,
      private departmentService: DepartmentService,
      private roleService: RoleService) {}
  
  
    ngOnInit(): void {

      this.departmentIdSubscription = this.userService.departmentIdState.subscribe((id: number) => {
        this.changedDepartmentId = id;
      });

      this.departmentChangeStatusSubscription = this.userService.changeDepartmentState.subscribe((status: boolean) => {
        this.departmentChangeStatus = status;
      });

      this.departmentsSubscription = this.departmentService.getAllDepartments()
        .pipe(first())
        .subscribe(departments => {
          this.departments = departments;
        });

      this.loadRoles();

      this.selectDepartmentForm = this.formBuilder.group({
        departmentId: [this.selectedDepartmentId, Validators.required],
        hideRequired: this.hideRequiredControl,
        floatLabel: this.floatLabelControl
      });

      this.selectRoleForm = this.formBuilder.group({
        roleName: [this.selectedRoleName],
        hideRequired: this.hideRequiredControl,
        floatLabel: this.floatLabelControl
      });

      console.log("DEPARTMENT ID: "+this.selectedDepartmentId);

      this.userService.departmentIdSubject.next(this.selectedDepartmentId);
  
      this.dataSource = new UsersDataSource(this.userService);
  
      this.dataSource.loadUsers(this.selectDepartmentForm.value.departmentId,
                                this.selectRoleForm.value.roleId,
                                 '', 0, 3, 'asc', this.currentColumnDef);
  
      this.pageDetailSubscription = this.dataSource.pageDetailState.pipe(
        switchMap(async (pageDetail: PageDetail) => {
          this.totalItems = pageDetail.totalItems;
          this.currentPageItems = pageDetail.currentPageItems;
          this.currentPage = pageDetail.currentPage;
          //console.log("Entered to SwitchMap");
          if(this.currentActivityState.includes('added')) {
            //console.log("I am inside switchmap added state");
              this.paginator.pageIndex = pageDetail.totalPages - 1;
              this.refreshTable();
              this.currentActivityState = '';
          }
        })
      ).subscribe();
      
      this.snackbarSubscription = this.snackbarService.snackbarState.subscribe(
        (state: SnackbarData) => {
          this.currentActivityState = state.message;
          if(this.currentActivityState.includes('added')) {
            //console.log('Current State: '+this.currentState);
            if (this.selectDepartmentForm.value.departmentId !== 0) {
              this.selectedDepartmentId = this.changedDepartmentId;
              this.paginator.pageIndex = 0;
              this.refreshTable();
            } else {
              this.paginator.pageIndex = 0;
              this.refreshTable();
            }

          } else if(this.currentActivityState.includes('deleted') && this.currentPageItems === 1) {
            //console.log("I am inside Deleted state");
            //console.log("CURRENT PAGE: "+this.currentPage);
            this.paginator.pageIndex = this.currentPage - 1;
            this.refreshTable();
            this.currentActivityState = '';
          } else if(this.currentActivityState.includes('updated')) {
            if (this.departmentChangeStatus && this.selectDepartmentForm.value.departmentId !== 0) {
              this.paginator.pageIndex = this.currentPage - 1;
              this.refreshTable();
              this.currentActivityState = '';
              this.departmentChangeStatus = false;
              this.userService.changeDepartmentSubject.next(false);
            } else {
              this.paginator.pageIndex = this.currentPage;
              this.refreshTable();
            }
          } else {
            this.refreshTable();
          }
        }
      );
    }

    get f() { return this.selectDepartmentForm.controls; }

    onDepartmentSelectSubmit() {
      this.roleModulator();
      this.router.navigate(['/users'], { relativeTo: this.route });
      this.submitted = true;
      //console.log("HAAAAALOOOO!!!");
      if(this.selectDepartmentForm.invalid) {
        return;
      }
      this.isLoading = true;
      //console.log("DEPARTMENT ID: "+ this.selectDepartmentForm.value.departmentId);
      this.selectedDepartmentId = this.selectDepartmentForm.value.departmentId;

      this.paginator.pageIndex = 0;
      this.paginator.pageSize;
      this.sort.direction='asc'
      this.currentColumnDef;
      console.log("DEPARTMENT ID: "+this.selectedDepartmentId);
      this.userService.departmentIdSubject.next(this.selectedDepartmentId);
  
      this.refreshTable();
    }

    onRoleSelectSubmit() {
      this.router.navigate(['/users'], { relativeTo: this.route });
      this.submitted = true;
      //console.log("HAAAAALOOOO!!!");
      if(this.selectRoleForm.invalid) {
        return;
      }
  
      this.isLoading = true;
      //console.log("DEPARTMENT ID: "+ this.selectDepartmentForm.value.departmentId);
      this.selectedDepartmentId = this.selectDepartmentForm.value.departmentId;
      this.selectedRoleName = this.selectRoleForm.value.roleName;
      this.paginator.pageIndex = 0;
      this.paginator.pageSize;
      this.sort.direction='asc'
      this.currentColumnDef;
      console.log("DEPARTMENT ID: "+this.selectedDepartmentId);
      this.userService.departmentIdSubject.next(this.selectedDepartmentId);
  
      this.refreshTable();
    }

    get rf() { return this.selectRoleForm.controls; }
  
    ngAfterViewInit() {
      this.sort.sortChange.subscribe(() => {
        this.currentColumnDef = this.sort.active;
        //console.log("SORT ACTIVE: "+this.sort.active);
      //console.log("Sort changed "+this.sort.direction);
        this.paginator.pageIndex = 0;
      });
      fromEvent(this.input.nativeElement,'keyup')
          .pipe(
              debounceTime(150),
              distinctUntilChanged(),
              tap(() => {
                  this.paginator.pageIndex = 0;
  
                  this.loadUsersPage();
              })
          )
          .subscribe();
  
      merge(this.sort.sortChange, this.paginator.page)
      .pipe(
          tap(() => this.loadUsersPage())
      )
      .subscribe();
    }
  
    loadUsersPage() {
      this.dataSource.loadUsers(
          this.selectedDepartmentId,
          this.selectedRoleName,
          this.input.nativeElement.value,
          this.paginator.pageIndex,
          this.paginator.pageSize,
          this.sort.direction,
          this.currentColumnDef);
    }
    
    refreshTable() {
      //console.log("INPUT VALUE: "+this.input.nativeElement.value);
      if (this.input.nativeElement.value === '') {
        this.loadUsersPage();
      } else {
        this.clearInput();
      }
    }
  
    clearInput() {
      this.input.nativeElement.value='';
      this.loadUsersPage();
    }

    loadRoles() {
      this.rolesSubscription = this.roleService.getAllRoles()
      .pipe(first())
      .subscribe(userRoles => {
        this.roles = userRoles;
      });
    }

    roleModulator() {
      this.roles.forEach(role => {
        if (role.name.includes('ROLE_ADMIN')) {
          if (this.selectDepartmentForm.value.departmentId !== 0) {
            this.removeAdminRole();
            if (this.selectedRoleName.includes('ROLE_ADMIN')) {
              this.selectRoleForm.patchValue({
                roleName: ''
              });
              this.selectedRoleName = this.selectRoleForm.value.roleName;
            }
          }
        } else {
          if (this.selectDepartmentForm.value.departmentId === 0) {
            this.loadRoles();
          }
        }
      });
    }

    removeAdminRole() {
      this.roles.forEach((role,index)=>{
        if(role.name.includes('ROLE_ADMIN')) this.roles.splice(index,1);
     });
     
     console.log(this.roles);
    }
  
    ngOnDestroy(): void {
      if (this.departmentsSubscription) {
        this.departmentsSubscription.unsubscribe();
      }
      if (this.pageDetailSubscription) {
        this.pageDetailSubscription.unsubscribe();
      }
      if (this.snackbarSubscription) {
        this.snackbarSubscription.unsubscribe();
      }
      if (this.departmentIdSubscription) {
        this.departmentIdSubscription.unsubscribe();
      }
      if (this.departmentChangeStatusSubscription) {
        this.departmentChangeStatusSubscription.unsubscribe();
      }
      if (this.rolesSubscription) {
        this.rolesSubscription.unsubscribe();
      }
    }

}