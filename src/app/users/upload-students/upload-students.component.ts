import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadFilesService } from 'src/app/common/services/upload-files.service';
import { SnackbarService } from 'src/app/common/snackbars/snackbar.service';

@Component({
  selector: 'app-upload-students',
  templateUrl: './upload-students.component.html',
  styleUrls: ['./upload-students.component.css']
})
export class UploadStudentsComponent implements OnInit {

  selectedFiles?: FileList;
  currentFile?: File;
  progress: number = 0;
  message = '';

  @ViewChild('input') input!: ElementRef;
  @ViewChild(MatProgressBar) matProgressBar!: MatProgressBar;

  constructor(
      private uploadService: UploadFilesService,
      private snackbarService: SnackbarService,
      private route: ActivatedRoute,
      private router: Router) { }

  ngOnInit(): void {
  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    this.progress = 0;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.currentFile = file;

        this.uploadService.uploadStudents(this.currentFile).subscribe(
          (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              console.log("PROGRESS !!"+this.progress);
              //this.progress = Math.round(100 * event.loaded / event.total);
              console.log("PROGRESS: "+this.progress);
            } else if (event instanceof HttpResponse) {
              setTimeout(()=>{
                this.currentFile = undefined;
              }, 2000);
              this.message = event.body.message;
              this.snackbarService.success(this.message);
              this.router.navigate(['../'], { relativeTo: this.route });
            }
          },
          (err: any) => {
            this.progress = 0;
            setTimeout(()=>{
              this.currentFile = undefined;
              this.clearInputLoader();
            }, 2000);
          });
      }
      this.selectedFiles = undefined;
    }
  }

  onCancel() {
    this.router.navigate(['/users'], { relativeTo: this.route});
  }

  clearInputLoader() {
    this.input.nativeElement.value='';
  }

}