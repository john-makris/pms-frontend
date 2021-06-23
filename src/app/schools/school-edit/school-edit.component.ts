import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AppModule } from 'src/app/app.module';
import { SchoolService } from '../school.service';

export interface SchoolData {
  name: string;
  location: string;
}

@Component({
  selector: 'app-school-edit',
  templateUrl: './school-edit.component.html',
  styleUrls: ['./school-edit.component.css']
})
export class SchoolEditComponent implements OnInit {
  schoolForm!: FormGroup;
  id!: number;
  isAddMode!: boolean;
  isLoading: boolean = false;
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private schoolService: SchoolService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.isAddMode = params['id'] == null;
          if(!this.isAddMode) {
            this.schoolService.getSchoolById(this.id)
              .pipe(first())
              .subscribe(x => {
                this.schoolForm.patchValue(x);
              });
          }
        }
      );

      this.schoolForm = this.formBuilder.group({
        name: ['', Validators.required],
        location: ['', Validators.required]
      });
  }

  get f() { return this.schoolForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.schoolForm.invalid) {
      return;
    }

    this.isLoading = true;
    const schoolData = {
      name: this.schoolForm.value.name,
      location: this.schoolForm.value.location
    };

    if (this.isAddMode) {
      this.createSchool(schoolData);
    } else {
      this.updateSchool(schoolData)
    }
  }

  private createSchool(schoolData: SchoolData) {
    this.schoolService.createSchool(schoolData)
      .pipe(first())
      .subscribe(() => {
        this.router.navigate(['../'], { relativeTo: this.route });
      })
      .add(() => { this.isLoading = false; });
  }

  private updateSchool(schoolData: SchoolData) {
    this.schoolService.updateSchool(this.id, schoolData)
      .pipe(first())
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route});
      })
      .add(() => this.isLoading = false);
  }

  onCancel() {
    this.router.navigate(['/schools'], { relativeTo: this.route});
  }

}