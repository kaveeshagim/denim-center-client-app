import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HomeComponent} from './view/home/home.component';
import {LoginComponent} from './view/login/login.component';
import {MainwindowComponent} from './view/mainwindow/mainwindow.component';
import {EmployeeComponent} from './view/modules/employee/employee.component';
import {UserComponent} from './view/modules/user/user.component';
import {MatGridListModule} from "@angular/material/grid-list";
import {MatCardModule} from "@angular/material/card";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import {MessageComponent} from "./util/dialog/message/message.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {HttpClientModule} from "@angular/common/http";
import {MatSelectModule} from "@angular/material/select";
import { ProductComponent } from './view/modules/product/product.component';
import { MaterialComponent } from './view/modules/material/material.component';
import { MaterialinventoryComponent } from './view/modules/materialinventory/materialinventory.component';
import { ProductinventoryComponent } from './view/modules/productinventory/productinventory.component';
import { SupplierComponent } from './view/modules/supplier/supplier.component';
import { CustomerComponent } from './view/modules/customer/customer.component';
import { CustomerreturnComponent } from './view/modules/customerreturn/customerreturn.component';
import { SupplierreturnComponent } from './view/modules/supplierreturn/supplierreturn.component';
import { SupplierpaymentComponent } from './view/modules/supplierpayment/supplierpayment.component';
import { CustomerpaymentComponent } from './view/modules/customerpayment/customerpayment.component';
import { GrnComponent } from './view/modules/grn/grn.component';
import { InvoiceComponent } from './view/modules/invoice/invoice.component';
import { ProductionorderComponent } from './view/modules/productionorder/productionorder.component';
import { CorderComponent } from './view/modules/corder/corder.component';
import { PorderComponent } from './view/modules/porder/porder.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {ConfirmComponent} from "./util/dialog/confirm/confirm.component";
import {EmployeeService} from "./service/employeeservice";
import {DatePipe} from "@angular/common";
import { BillofmaterialComponent } from './view/modules/billofmaterial/billofmaterial.component';
import { ProductmovementComponent } from './view/modules/productmovement/productmovement.component';
import { MaterialmovementComponent } from './view/modules/materialmovement/materialmovement.component';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {ProductService} from "./service/productservice";
import {MaterialService} from "./service/materialservice";
import {CorderService} from "./service/corderservice";
import {PorderService} from "./service/porderservice";
import {GrnService} from "./service/grnservice";
import {InvoiceService} from "./service/invoiceservice";
import {CustomerpaymentService} from "./service/customerpaymentservice";
import {SupplierpaymentService} from "./service/supplierpaymentservice";
import {CustomerService} from "./service/customerservice";
import {SupplierService} from "./service/supplierservice";
import {UserService} from "./service/userservice";
import {MaterialinventoryService} from "./service/materialinventoryservice";
import {MaterialmovementService} from "./service/materialmovementservice";
import {ProductinventoryService} from "./service/productinventoryservice";
import {ProductmovementService} from "./service/productmovementservice";
import {ProductionorderService} from "./service/productionorderservice";
import {CustomerreturnService} from "./service/customerreturnservice";
import {SupplierreturnService} from "./service/supplierreturnservice";
import { CountbyproductionstatusComponent } from './report/view/countbyproductionstatus/countbyproductionstatus.component';
import {CountbyporderstatusComponent} from "./report/view/countbyporderstatus/countbyporderstatus.component";
import {CountbycorderstatusComponent} from "./report/view/countbycorderstatus/countbycorderstatus.component";
import { ExpenseComponent } from './report/view/expense/expense.component';
import { DashboardComponent } from './view/dashboard/dashboard.component';
import {MatChipsModule} from "@angular/material/chips";
import { ProductinventoryreportComponent } from './report/view/productinventoryreport/productinventoryreport.component';
import { MaterialinventoryreportComponent } from './report/view/materialinventoryreport/materialinventoryreport.component';
import { IncomeexpenseComponent } from './report/view/incomeexpense/incomeexpense.component';
import { IncomeComponent } from './report/view/income/income.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    MainwindowComponent,
    EmployeeComponent,
    UserComponent,
    MessageComponent,
    ProductComponent,
    MaterialComponent,
    BillofmaterialComponent,
    MaterialinventoryComponent,
    ProductinventoryComponent,
    MaterialmovementComponent,
    ProductmovementComponent,
    SupplierComponent,
    CustomerComponent,
    CustomerreturnComponent,
    SupplierreturnComponent,
    SupplierpaymentComponent,
    CustomerpaymentComponent,
    GrnComponent,
    InvoiceComponent,
    ProductionorderComponent,
    CorderComponent,
    PorderComponent,
    ConfirmComponent,
    BillofmaterialComponent,
    ProductmovementComponent,
    MaterialmovementComponent,
    CountbyproductionstatusComponent,
    CountbyporderstatusComponent,
    CountbycorderstatusComponent,
    ExpenseComponent,
    DashboardComponent,
    ProductinventoryreportComponent,
    MaterialinventoryreportComponent,
    IncomeexpenseComponent,
    IncomeComponent
  ],
    imports: [
        MatTableModule,
        MatPaginatorModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatGridListModule,
        MatCardModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatExpansionModule,
        MatIconModule,
        MatDialogModule,
        HttpClientModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        FormsModule,
        MatChipsModule,
    ],
  providers: [EmployeeService, ProductService, MaterialService, CorderService,
    PorderService, GrnService, InvoiceService,
    CustomerpaymentService, SupplierpaymentService, CustomerService, SupplierService,
    UserService, MaterialinventoryService, MaterialmovementService, ProductinventoryService,
    ProductmovementService, ProductionorderService,
    CustomerreturnService, SupplierreturnService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule {
}
