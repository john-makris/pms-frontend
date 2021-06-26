import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EnsureDialogData } from '../ensure-dialog-data.interface';

@Component({
  selector: 'app-ensure-dialog',
  templateUrl: './ensure-dialog.component.html',
  styleUrls: ['./ensure-dialog.component.css']
})
export class EnsureDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EnsureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EnsureDialogData
  ) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}
