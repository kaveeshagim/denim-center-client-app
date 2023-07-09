import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Customerreturn} from "../../../entity/customerreturn";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Customer} from "../../../entity/customer";
import {Paymentmethod} from "../../../entity/paymentmethod";
import {Paymentstatus} from "../../../entity/paymentstatus";
import {UiAssist} from "../../../util/ui/ui.assist";
import {CustomerreturnService} from "../../../service/customerreturnservice";
import {CustomerService} from "../../../service/customerservice";
import {PaymentmethodService} from "../../../service/paymentmethodservice";
import {PaymentstatusService} from "../../../service/paymentstatusservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Invoice} from "../../../entity/invoice";
import {InvoiceService} from "../../../service/invoiceservice";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-customerreturn',
  templateUrl: './customerreturn.component.html',
  styleUrls: ['./customerreturn.component.css']
})
export class CustomerreturnComponent {

  columns: string[] = ['qty', 'date', 'returncost', 'reason', 'customer', 'invoice'];
  headers: string[] = ['Qty', 'Date', 'Returncost', 'Reason', 'Customer', 'Invoice'];
  binders: string[] = ['qty', 'date', 'returncost', 'reason', 'customer.companyname', 'invoice.number'];



  public ssearch!: FormGroup;
  public form!: FormGroup;

  customerreturn!: Customerreturn;
  oldcustomerreturn!: Customerreturn|undefined;

  selectedrow: any;
  customerreturns: Array<Customerreturn> = [];
  data!: MatTableDataSource<Customerreturn>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  imageempurl: string = 'assets/default.png';

  customers: Array<Customer> = [];
  invoices: Array<Invoice> = [];



  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private crs: CustomerreturnService,
    private cs: CustomerService,
    private os: InvoiceService,
    private ts: TokenStorageService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssinvoice": new FormControl(),
      "sscustomer": new FormControl(),


    });

    this.form = this.fb.group({
      "date": new FormControl('', [Validators.required]),
      "qty": new FormControl('', [Validators.required]),
      "reason": new FormControl('', ),
      "returncost": new FormControl('', [Validators.required]),
      "customer": new FormControl('', [Validators.required]),
      "invoice": new FormControl('', [Validators.required]),
    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.cs.getAllList().then((gens: Customer[]) => {
      this.customers = gens;
      console.log("G-" + this.customers);
    });
    this.os.getAllList().then((gens: Invoice[]) => {
      this.invoices = gens;
      console.log("G-" + this.invoices);
    });


      this.createForm();


    this.createSearch();
  }

  createView() {
    this.loadTable("");
  }

  createSearch(){ }

  createForm(){
    this.form.controls['date'].setValidators([Validators.required]);
    this.form.controls['qty'].setValidators([Validators.required]);
    this.form.controls['invoice'].setValidators([Validators.required]);
    this.form.controls['customer'].setValidators([Validators.required]);
    //this.form.controls['reason'].setValidators([Validators.required]);
    this.form.controls['returncost'].setValidators([Validators.required]);


    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="date")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldcustomerreturn != undefined && control.valid) {
          // @ts-ignore
          if (value === this.customerreturn[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    this.loadForm();
  }

  loadForm(){
    this.oldcustomerreturn = undefined;
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
    this.crs.getAll(query)
      .then((prods: Customerreturn[]) => {
        this.customerreturns = prods;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.customerreturns);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let invoiceid = ssearchdata.ssinvoice;
    let customerid = ssearchdata.sscustomer;


    let query="";

    if(customerid!=null) query=query+"&customerid="+customerid;
    if(invoiceid!=null) query=query+"&invoiceid="+invoiceid;



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

  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Customerreturn Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.customerreturn = this.form.getRawValue();
      let proddata: string = "";
      proddata = proddata + "<br>Invoice number is : "+ this.customerreturn.invoice.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Customerreturn Add", message: "Are you sure to Add the following Customerreturn? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("CustomerreturnService.add(emp)");
          this.crs.add(this.customerreturn).then((response: []|undefined) => {
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
              data: {heading: "Status -Customerreturn Add", message: addmessage}
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

onTabChange(event: MatTabChangeEvent){}
  fillForm(customerreturn:Customerreturn) {

    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_EXECUTIVE")) {
      this.enableButtons(false, true, true);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow=customerreturn;

    this.customerreturn = JSON.parse(JSON.stringify(customerreturn));
    this.oldcustomerreturn = JSON.parse(JSON.stringify(customerreturn));

    //@ts-ignore
    this.customerreturn.customer = this.customers.find(g => g.id === this.customerreturn.customer.id);
    //@ts-ignore
    this.customerreturn.invoice = this.invoices.find(a => a.id === this.customerreturn.invoice.id);




    this.form.patchValue(this.customerreturn);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Customerreturn Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Customerreturn Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.customerreturn = this.form.getRawValue();
            //@ts-ignore
            this.customerreturn.id = this.oldcustomerreturn.id;
            this.crs.update(this.customerreturn).then((response: [] | undefined) => {
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
                data: {heading: "Status -Customerreturn Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Customerreturn Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Customerreturn Delete",
        message: "Are you sure to Delete folowing Customerreturn? <br> <br>" +
          this.customerreturn.id
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.crs.delete(this.customerreturn.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Customerreturn Delete ", message: delmessage}
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
