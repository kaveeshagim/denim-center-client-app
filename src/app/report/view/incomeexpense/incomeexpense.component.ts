import {Component, OnInit, ViewChild} from '@angular/core';
import {Customerpayment} from "../../../entity/customerpayment";
import {Supplierpayment} from "../../../entity/supplierpayment";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MaterialinventoryService} from "../../../service/materialinventoryservice";
import {Materialinventory} from "../../../entity/materialinventory";
import {MatTableDataSource} from "@angular/material/table";
import {CustomerpaymentService} from "../../../service/customerpaymentservice";
import {SupplierpaymentService} from "../../../service/supplierpaymentservice";

declare var google: any;
@Component({
  selector: 'app-incomeexpense',
  templateUrl: './incomeexpense.component.html',
  styleUrls: ['./incomeexpense.component.css']
})
export class IncomeexpenseComponent implements OnInit{

ngOnInit() {
}

}
