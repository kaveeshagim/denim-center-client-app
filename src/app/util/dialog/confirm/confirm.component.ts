import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-dialog',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent {

  lines?: [];

  constructor(public dialogRef: MatDialogRef<ConfirmComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.lines = this.data.message.split('<br>').filter((line: string) => line !== '');

  }

  ngOnInit(): void {
    this.dialogRef.addPanelClass('custom-dialog');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}

