import {Component, Output, EventEmitter, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Invoice} from "../../../entity/invoice";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Invoicestatus} from "../../../entity/invoicestatus";
import {UiAssist} from "../../../util/ui/ui.assist";
import {InvoiceService} from "../../../service/invoiceservice";
import {InvoicestatusService} from "../../../service/invoicestatusservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Customer} from "../../../entity/customer";
import {Corder} from "../../../entity/corder";
import {CorderService} from "../../../service/corderservice";
import {CustomerService} from "../../../service/customerservice";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent {

  columns: string[] = ['number', 'datecreated', 'totalamount', 'paidamount', 'remarks', 'corder', 'customer', 'invoicestatus'];
  headers: string[] = ['Number', 'Datecreated', 'Totalamount', 'Paidamount', 'Remarks', 'Corder', 'Customer', 'Invoicestatus'];
  binders: string[] = ['number', 'datecreated', 'totalamount', 'paidamount', 'remarks', 'corder.number', 'customer.companyname', 'invoicestatus.name'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  invoice!: Invoice;
  oldinvoice!: Invoice|undefined;

  selectedrow: any;
  invoices: Array<Invoice> = [];
  data!: MatTableDataSource<Invoice>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  imageempurl: string = 'assets/default.png';

  corders: Array<Corder> = [];
  customers: Array<Customer> = [];
  invoicestatuses: Array<Invoicestatus> = [];

  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private is: InvoiceService,
    private os: CorderService,
    private cs: CustomerService,
    private iss: InvoicestatusService,
    private ts: TokenStorageService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssnumber": new FormControl(),
      "sscorder": new FormControl(),
      "sscustomer": new FormControl(),
      "ssinvoicestatus": new FormControl(),


    });

    this.form = this.fb.group({
      "number": new FormControl('', [Validators.required, Validators.pattern("^\\d{4}$")]),
      "datecreated": new FormControl('', [Validators.required]),
      "totalamount": new FormControl('', [Validators.required]),
      "paidamount": new FormControl('', [Validators.required]),
      "remarks": new FormControl('', ),
      "corder": new FormControl('', [Validators.required]),
      "customer": new FormControl('', [Validators.required]),
      "invoicestatus": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.os.getAllList().then((ors: Corder[]) => {
      this.corders = ors;
      console.log("G-" + this.corders);
    });
    this.cs.getAllList().then((cus: Customer[]) => {
      this.customers = cus;
      console.log("S-" + this.customers);
    });
    this.iss.getAllList().then((ists: Invoicestatus[]) => {
      this.invoicestatuses = ists;
      console.log("C-" + this.invoicestatuses);
    });

    this.rs.get('invoice').then((regs: []) => {
      this.regexes = regs;
      console.log("R-" + this.regexes['number']['regex']);
      this.createForm();
    });

    this.createSearch();
  }

  createView() {
    this.loadTable("");
  }

  createSearch(){ }

  createForm(){
    this.form.controls['number'].setValidators([Validators.required,Validators.pattern(this.regexes['number']['regex'])]);
    this.form.controls['datecreated'].setValidators([Validators.required]);
    this.form.controls['totalamount'].setValidators([Validators.required]);
    this.form.controls['paidamount'].setValidators([Validators.required]);
    //this.form.controls['remarks'].setValidators([Validators.required]);
    this.form.controls['corder'].setValidators([Validators.required]);
    this.form.controls['customer'].setValidators([Validators.required]);
    this.form.controls['invoicestatus'].setValidators([Validators.required]);

    this.form.get('corder')?.valueChanges.subscribe((selectedCorder) => {
      this.updateSelection(selectedCorder);
    });

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="datecreated")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldinvoice != undefined && control.valid) {
          // @ts-ignore
          if (value === this.invoice[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    this.loadForm();
  }

  loadForm(){
    this.oldinvoice = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_EXECUTIVE")) {
      this.enableButtons(true, false, false);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.is.getAll(query)
      .then((prods: Invoice[]) => {
        this.invoices = prods;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.invoices);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let number = ssearchdata.ssnumber;
    let corderid = ssearchdata.sscorder;
    let customerid = ssearchdata.sscustomer;
    let invoicestatusid = ssearchdata.ssinvoicestatus;


    let query="";

    if(number!=null && number.trim()!="") query=query+"&number="+number;
    if(corderid!=null) query=query+"&corderid="+corderid;
    if(customerid!=null) query=query+"&customerid="+customerid;
    if(invoicestatusid!=null) query=query+"&invoicestatusid="+invoicestatusid;


    if(query!="") query = query.replace(/^./, "?")
    this.loadTable(query);
  }

  btnSearchClearMc():void {
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {heading: "Search Clear", message: "Are you sure you want to Clear the Search?"}
    });

    confirm.afterClosed().subscribe(async result => {
      if (result){
        this.ssearch.reset();
        this.loadTable("");
      }

    });
  }

  updateSelection(selectedCorder: any) {
    this.updateTotalAmount(selectedCorder);
    //this.updateCustomer(selectedCorder);
  }


  /*updateCustomer(selectedCorder: any) {
    console.log("Selected Corder:", selectedCorder);
    const customerControl = this.form.get('customer');

    if (customerControl) {
      if (selectedCorder) {
        const customer = selectedCorder.customer.companyname;
        customerControl.patchValue({ value: customer });
      } else {
        customerControl.reset();
      }
    }
  }*/


  updateTotalAmount(selectedCorder: any) {
    console.log("Selected Corder:", selectedCorder);
    const totalAmountControl = this.form.get('totalamount');

    if (totalAmountControl) {
      if (selectedCorder) {
        const totalAmount = selectedCorder.totalprice;
        totalAmountControl.setValue(totalAmount);
      } else {
        totalAmountControl.reset();
      }
    }
  }



  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Invoice Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.invoice = this.form.getRawValue();
      let proddata: string = "";
      proddata = proddata + "<br>Number is : "+ this.invoice.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Invoice Add", message: "Are you sure to Add the following Invoice? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("InvoiceService.add(emp)");
          this.is.add(this.invoice).then((response: []|undefined) => {
            console.log("Res-"+response);
            console.log("Un-"+response==undefined);
            if(response!=undefined){ // @ts-ignore
              console.log("Add-"+response['id']+"-"+response['url']+"-"+(response['errors']==""));
              // @ts-ignore
              addstatus = response['errors']=="";
              console.log("Add Sta-"+addstatus);
              if(!addstatus) { // @ts-ignore
                addmessage=response['errors'];
              }
            }
            else{
              console.log("undefined");
              addstatus=false;
              addmessage="Content Not Found"
            }
          }).finally( () =>{
            if(addstatus) {
              addmessage = "Successfully Saved";
              this.form.reset();
              //this.clearImage();
              this.loadTable("");
            }
            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Invoice Add", message: addmessage}
            });
            stsmsg.afterClosed().subscribe(async result => { if (!result) { return;} }) ;} );
        }
      });
    }
  }

  getErrors(): string {
    let errors: string = "";
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.errors) {
        if (this.regexes[controlName] != undefined)
        { errors = errors+"<br>" + this.regexes[controlName]['message'];
        } else {
          errors = errors + "<br>Invalid " + controlName;
        }
      }
    }
    return errors;

  }

  onTabChange(event: MatTabChangeEvent) {}
  fillForm(invoice:Invoice) {

    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_EXECUTIVE")) {
      this.enableButtons(false, true, true);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow=invoice;

    this.invoice = JSON.parse(JSON.stringify(invoice));
    this.oldinvoice = JSON.parse(JSON.stringify(invoice));

    //@ts-ignore
    this.invoice.corder = this.corders.find(p => p.id === this.invoice.corder.id);
    //@ts-ignore
    this.invoice.customer = this.customers.find(s => s.id === this.invoice.customer.id);
    //@ts-ignore
    this.invoice.invoicestatus = this.invoicestatuses.find(t => t.id === this.invoice.invoicestatus.id);


    this.form.patchValue(this.invoice);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Invoice Update ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    } else {
      let updates: string = this.getUpdates();
      if (updates != "") {
        let updstatus: boolean = false;
        let updmessage: string = "Server Not Found";
        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: "Confirmation - Invoice Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.invoice = this.form.getRawValue();
            //@ts-ignore
            this.invoice.id = this.oldinvoice.id;
            this.is.update(this.invoice).then((response: [] | undefined) => {
              if (response != undefined) { // @ts-ignore
                // @ts-ignore
                updstatus = response['errors'] == "";

                if (!updstatus) { // @ts-ignore
                  updmessage = response['errors'];
                }
              } else {
                //console.log("undefined");
                updstatus = false;
                updmessage = "Content Not Found"
              }
            } ).finally(() => {
              if (updstatus) {
                updmessage = "Successfully Updated";
                this.loadForm();
                this.loadTable("");

              }
              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {heading: "Status -Invoice Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Invoice Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }



  getUpdates(): string {
    let updates: string = "";
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.dirty) {
        updates = updates + "<br>" + controlName.charAt(0).toUpperCase() + controlName.slice(1)+" Changed";
      }
    }
    return updates;
  }

  enableButtons(add:boolean, upd:boolean, del:boolean) {
    this.enaadd=add;
    this.enaupd=upd;
    this.enadel=del;

  }

  delete() {
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: "Confirmation - Invoice Delete",
        message: "Are you sure to Delete folowing Invoice? <br> <br>" +
          this.invoice.number
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.is.delete(this.invoice.id).then((response: [] | undefined) => {
          if (response != undefined) { // @ts-ignore
            delstatus = response['errors'] == "";
            if (!delstatus) { // @ts-ignore
              delmessage = response['errors'];
            }
          } else {
            delstatus = false;
            delmessage = "Content Not Found"
          }
        } ).finally(() => {
          if (delstatus) {
            delmessage = "Successfully Deleted";
            this.loadForm();
            this.loadTable("");

          }
          const stsmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {heading: "Status - Invoice Delete ", message: delmessage}
          });
          stsmsg.afterClosed().subscribe(async result => { if (!result) { return; }
          });
        });
      }
    });
  }

  clear() {
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Clear Form',
        message: "Are you sure to Clear the Form? <br><br> You will lose your updates"
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        this.loadForm();
      }
    });
  }


}
