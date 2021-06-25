import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EnsureDialogData } from '../ensure-dialog-data.interface';
import { EnsureDialogService } from '../ensure-dialog.service';

@Component({
  selector: 'app-ensure-dialog',
  templateUrl: './ensure-dialog.component.html',
  styleUrls: ['./ensure-dialog.component.css']
})
export class EnsureDialogComponent implements OnInit {

  constructor(
    private ensureDialogService: EnsureDialogService,
    public dialogRef: MatDialogRef<EnsureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EnsureDialogData
  ) { }

  ngOnInit(): void {
  }

  onClick(): void {
    this.ensureDialogService.ensureDialogSubject.next(true);
  }

  onNoClick(): void {
    this.ensureDialogService.ensureDialogSubject.next(false);
    this.dialogRef.close();
  }

}
