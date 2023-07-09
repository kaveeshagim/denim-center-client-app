import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./view/login/login.component";
import {MainwindowComponent} from "./view/mainwindow/mainwindow.component";
import {EmployeeComponent} from "./view/modules/employee/employee.component";
import {HomeComponent} from "./view/home/home.component";
import {UserComponent} from "./view/modules/user/user.component";
import {SupplierComponent} from "./view/modules/supplier/supplier.component";
import {CustomerComponent} from "./view/modules/customer/customer.component";
import {SupplierreturnComponent} from "./view/modules/supplierreturn/supplierreturn.component";
import {CustomerreturnComponent} from "./view/modules/customerreturn/customerreturn.component";
import {ProductComponent} from "./view/modules/product/product.component";
import {MaterialComponent} from "./view/modules/material/material.component";
import {ProductionorderComponent} from "./view/modules/productionorder/productionorder.component";
import {CorderComponent} from "./view/modules/corder/corder.component";
import {PorderComponent} from "./view/modules/porder/porder.component";
import {GrnComponent} from "./view/modules/grn/grn.component";
import {InvoiceComponent} from "./view/modules/invoice/invoice.component";
import {CustomerpaymentComponent} from "./view/modules/customerpayment/customerpayment.component";
import {SupplierpaymentComponent} from "./view/modules/supplierpayment/supplierpayment.component";
import {ProductinventoryComponent} from "./view/modules/productinventory/productinventory.component";
import {MaterialinventoryComponent} from "./view/modules/materialinventory/materialinventory.component";
import {ProductmovementComponent} from "./view/modules/productmovement/productmovement.component";
import {MaterialmovementComponent} from "./view/modules/materialmovement/materialmovement.component";
import {BillofmaterialComponent} from "./view/modules/billofmaterial/billofmaterial.component";
import {Countbyproductionstatus} from "./report/entity/countbyproductionstatus";
import {
  CountbyproductionstatusComponent
} from "./report/view/countbyproductionstatus/countbyproductionstatus.component";
import {CountbyporderstatusComponent} from "./report/view/countbyporderstatus/countbyporderstatus.component";
import {CountbycorderstatusComponent} from "./report/view/countbycorderstatus/countbycorderstatus.component";
import {ExpenseComponent} from "./report/view/expense/expense.component";
import {DashboardComponent} from "./view/dashboard/dashboard.component";
import {
  MaterialinventoryreportComponent
} from "./report/view/materialinventoryreport/materialinventoryreport.component";
import {ProductinventoryreportComponent} from "./report/view/productinventoryreport/productinventoryreport.component";
import {IncomeComponent} from "./report/view/income/income.component";
import {IncomeexpenseComponent} from "./report/view/incomeexpense/incomeexpense.component";
import {RegisterComponent} from "./view/register/register.component";
import {ProfileComponent} from "./view/profile/profile.component";
import {BoardManagerComponent} from "./view/board-manager/board-manager.component";
import {BoardExecutiveComponent} from "./view/board-executive/board-executive.component";
import {BoardAdminComponent} from "./view/board-admin/board-admin.component";
import {PrivilegeComponent} from "./view/modules/privilege/privilege.component";

const commonPaths = [
  { path: "dashboard", component: DashboardComponent },
  { path: "home", component: HomeComponent },
  { path: "profile", component: ProfileComponent },
  { path: "manager", component: BoardManagerComponent },
  { path: "executive", component: BoardExecutiveComponent },
  { path: "employee", component: EmployeeComponent },
  { path: "privilege", component: PrivilegeComponent},
  { path: "user", component: UserComponent },
  { path: "supplier", component: SupplierComponent },
  { path: "customer", component: CustomerComponent },
  { path: "product", component: ProductComponent },
  { path: "material", component: MaterialComponent },
  { path: "billofmaterial", component: BillofmaterialComponent },
  { path: "productinventory", component: ProductinventoryComponent },
  { path: "materialinventory", component: MaterialinventoryComponent },
  { path: "productmovement", component: ProductmovementComponent },
  { path: "materialmovement", component: MaterialmovementComponent },
  { path: "productionorder", component: ProductionorderComponent },
  { path: "customerorder", component: CorderComponent },
  { path: "purchaseorder", component: PorderComponent },
  { path: "grn", component: GrnComponent },
  { path: "invoice", component: InvoiceComponent },
  { path: "customerpayment", component: CustomerpaymentComponent },
  { path: "supplierpayment", component: SupplierpaymentComponent },
  { path: "supplierreturn", component: SupplierreturnComponent },
  { path: "customerreturn", component: CustomerreturnComponent },
  { path: "countbyproductionstatus", component: CountbyproductionstatusComponent },
  { path: "countbyporderstatus", component: CountbyporderstatusComponent },
  { path: "countbycorderstatus", component: CountbycorderstatusComponent },
  { path: "expense", component: ExpenseComponent },
  { path: "income", component: IncomeComponent },
  { path: "incomeexpense", component: IncomeexpenseComponent },
  { path: "materialinventoryreport", component: MaterialinventoryreportComponent },
  { path: "productinventoryreport", component: ProductinventoryreportComponent },
];

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "", redirectTo: "login", pathMatch: "full" },
  {
    path: "admin",
    component: BoardAdminComponent,
    children: commonPaths,
  },
  {
    path: "executive",
    component: BoardExecutiveComponent,
    children: commonPaths,
  },
  {
    path: "manager",
    component: BoardManagerComponent,
    children: commonPaths,
  },
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
