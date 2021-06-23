import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { School } from '../school.model';
import { SchoolService } from '../school.service';

@Component({
  selector: 'app-school-detail',
  templateUrl: './school-detail.component.html',
  styleUrls: ['./school-detail.component.css']
})
export class SchoolDetailComponent implements OnInit {
  id!: number;
  school!: School;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private schoolService: SchoolService) { }

  ngOnInit(): void {
    this.route.params
      .subscribe(
        (params: Params) => {
          this.id = params['id'];
          this.schoolService.getSchoolById(this.id)
          .pipe(first())
          .subscribe((x) => {
            this.school = x;
          });
      }
    );
  }

  editSchool() {
    this.router.navigate(['/schools/edit/', this.id], { relativeTo: this.route });
  }

  deleteSchool(id: number) {
    if (!this.school) return;
    this.school.isDeleting = false;
    this.schoolService.deleteSchoolById(id)
        .pipe(first())
        .subscribe(() => {
          this.school.isDeleting = false;
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
  }

  onCancel() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}