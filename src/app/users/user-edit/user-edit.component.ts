import { DoCheck } from '@angular/core';
import { Component, OnInit, OnDestroy, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';
import { Department } from 'src/app/departments/department.model';
import { DepartmentService } from 'src/app/departments/department.service';
import { UserResponseData } from '../common/payload/response/userResponseData.interface';
import { RoleService } from '../role.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit, DoCheck, OnDestroy {
  userForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;
  hide: boolean = true;

  currentUser!: UserResponseData;
  isStudent: boolean = false;
  addModeRoleNames: string[] = [];
  editModeRoleNames: string[] = [];
  currentSelectedRoleNames: Array<string> =[];
  selectedRoleNames = new FormControl([], Validators.required);

  allDepartments: boolean = true;
  departments: Department[] = [];
  selectedDepartmentId: string = '';
  currentDepartmentId: string = '';

  currentUserPassword: string = '';

  rolesSubscription!: Subscription;
  departmentsSubscription!: Subscription;
  departmentIdSubscription!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private roleService: RoleService,
    private departmentService: DepartmentService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.departmentIdSubscription = this.userService.departmentIdState
      .subscribe((departmentId: number) => {
        console.log("EDIT COMPONENT: "+departmentId);
        if (departmentId == 0) {
          this.allDepartments = true;
        } else {
          this.allDepartments = false;
          this.selectedDepartmentId = departmentId.toString();
        }
    });

    this.loadDepartments();

    this.id = this.route.snapshot.params['id'];
    this.loadRoles();
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.userService.getUserById(this.id)
              .pipe(first())
              .subscribe(currentUserData => {
                this.currentUser = currentUserData;
                console.log("USER EDIT STATUS: "+currentUserData.status);
                this.currentUserPassword = currentUserData.password;
                console.log("THIS IS THE CURRENT USER PASSWORD "+ this.currentUserPassword);
                if (currentUserData.department) {
                  this.currentDepartmentId = currentUserData.department.id.toString();
                } else {
                  this.currentDepartmentId = '';
                }
                currentUserData.roles.forEach(role => {
                    this.currentSelectedRoleNames.push(role.name);
                    console.log("Role: "+role.name);
                  });
                this.userForm.setValue({
                  am: currentUserData.am,
                  username: currentUserData.username,
                  email: currentUserData.email,
                  password: '',
                  selectedRoleNames: this.currentSelectedRoleNames,
                  departmentId: this.currentDepartmentId,
                  status: currentUserData.status
                });
                this.selectedDepartmentId = this.currentDepartmentId;
                console.log("Current Department ID: "+this.currentDepartmentId);
              });
          }
        }
      );

      console.log("BEFORE FORM INITIALIZATION: "+this.selectedDepartmentId);

      this.userForm = this.formBuilder.group({
        am: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(8)]],
        username: ['', [Validators.required, Validators.maxLength(25)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(20)]],
        password: ['', [Validators.minLength(10), Validators.maxLength(18)]],
        selectedRoleNames: this.selectedRoleNames,
        departmentId: [this.selectedDepartmentId, Validators.required],
        status: [false, Validators.required]
      });
  }

  ngDoCheck()	: void {
    if (this.f.selectedRoleNames.value.includes('ROLE_STUDENT')) {
      this.isStudent = true;
      this.f.am.enable();
    } else {
      this.isStudent = false;
      this.f.am.disable();
      console.log("VALIDITY");
    }
  }

  get f() { return this.userForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.userForm.invalid) {
      return;
    }

    console.log("Department ID: "+this.userForm.value.departmentId);

    this.isLoading = true;
    const userData = {
      am: this.userForm.value.am,
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      password: this.userForm.value.password === null ? this.currentUserPassword : this.userForm.value.password,
      roles : this.userForm.value.selectedRoleNames,
      department: {
        id: +this.userForm.value.departmentId
      },
      status: this.userForm.value.status
    };

    if (this.isAddMode) {
      console.log("User Data Add: "+userData);
      console.log(userData.am);
      console.log(userData.username);
      console.log(userData.email);
      console.log(userData.password);
      console.log(userData.roles);
      console.log(userData.department);
      console.log(userData.status);
      this.createUser(userData);
    } else {
      console.log("User Data Update: ");
      console.log(userData.am);
      console.log(userData.username);
      console.log(userData.email);
      console.log(userData.password);
      console.log(userData.roles);
      console.log(userData.department);
      console.log(userData.status);

      this.updateUser(userData);
    }
  }

  private createUser(userData: UserResponseData) {
    this.userService.createUser(userData)
      .pipe(first())
      .subscribe(() => {
        if (this.currentDepartmentId !== userData.department.id.toString()) {
          this.userService.departmentIdSubject.next(userData.department.id);
        }
        
        this.snackbarService.success('User added');
        this.router.navigate(['../'], { relativeTo: this.route });
      })
      .add(() => { this.isLoading = false; });
  }

  private updateUser(userData: any) {
    this.userService.updateUser(this.id, userData)
      .pipe(first())
      .subscribe(() => {
        if (this.currentDepartmentId !== userData.department.id.toString()) {
          this.userService.changeDepartmentSubject.next(true);
        }
        this.snackbarService.success('User updated');
        this.router.navigate(['/users'], { relativeTo: this.route});
      })
      .add(() => this.isLoading = false);
  }

  loadRoles() {
    this.rolesSubscription = this.roleService.getAllRoles()
    .pipe(first())
    .subscribe(roles => {
      roles.forEach(role => {
        if (!role.name.includes('ROLE_ADMIN')) {
          this.addModeRoleNames.push(role.name);
        }
        if (!role.name.includes('ROLE_ADMIN') && !role.name.includes('ROLE_STUDENT')) {
          this.editModeRoleNames.push(role.name);
        }
        console.log("Role: "+role.name);
      });
    });
  }

  loadDepartments() {
    this.departmentsSubscription = this.departmentService.getAllDepartments()
    .pipe(first())
    .subscribe(departments => {
      this.departments = departments;
      console.log(this.departments);
    });
  }

  onCancel() {
    this.router.navigate(['/users'], { relativeTo: this.route});
  }

  ngOnDestroy(): void {
    if (this.rolesSubscription) {
      this.rolesSubscription.unsubscribe();
    }
    if (this.departmentIdSubscription) {
      this.departmentIdSubscription.unsubscribe();
    }
    if(this.departmentsSubscription) {
      this.departmentsSubscription.unsubscribe();
    }
  }

}