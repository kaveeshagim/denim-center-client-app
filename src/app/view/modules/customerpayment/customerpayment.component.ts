import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Paymentstatus} from "../../../entity/paymentstatus";
import {UiAssist} from "../../../util/ui/ui.assist";
import {PaymentstatusService} from "../../../service/paymentstatusservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Paymentmethod} from "../../../entity/paymentmethod";
import {PaymentmethodService} from "../../../service/paymentmethodservice";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";
import {Customerpayment} from "../../../entity/customerpayment";
import {Customer} from "../../../entity/customer";
import {Invoice} from "../../../entity/invoice";
import {CustomerpaymentService} from "../../../service/customerpaymentservice";
import {CustomerService} from "../../../service/customerservice";
import {InvoiceService} from "../../../service/invoiceservice";

@Component({
  selector: 'app-customerpayment',
  templateUrl: './customerpayment.component.html',
  styleUrls: ['./customerpayment.component.css']
})
export class CustomerpaymentComponent {

  columns: string[] = ['date', 'amount', 'remarks', 'customer', 'invoice', 'paymentmethod', 'paymentstatus'];
  headers: string[] = ['Date', 'Amount', 'Remarks', 'Customer', 'Invoice', 'Paymentmethod', 'Paymentstatus'];
  binders: string[] = ['date', 'amount', 'remarks', 'customer.companyname', 'invoice.number', 'paymentmethod.name', 'paymentstatus.name'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  customerpayment!: Customerpayment;
  oldcustomerpayment!: Customerpayment|undefined;

  selectedrow: any;
  customerpayments: Array<Customerpayment> = [];
  data!: MatTableDataSource<Customerpayment>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  imageempurl: string = 'assets/default.png';

  customers: Array<Customer> = [];
  invoices: Array<Invoice> = [];
  paymentmethods: Array<Paymentmethod> = [];
  paymentstatuses: Array<Paymentstatus> = [];



  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private cps: CustomerpaymentService,
    private ss: CustomerService,
    private is: InvoiceService,
    private pms: PaymentmethodService,
    private pss: PaymentstatusService,
    private ts: TokenStorageService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssinvoice": new FormControl(),
      "sscustomer": new FormControl(),
      "sspaymentstatus": new FormControl(),
      "sspaymentmethod": new FormControl(),


    });

    this.form = this.fb.group({
      "date": new FormControl('', [Validators.required]),
      "amount": new FormControl('', [Validators.required]),
      "remarks": new FormControl('', ),
      "customer": new FormControl('', [Validators.required]),
      "invoice": new FormControl('', [Validators.required]),
      "paymentmethod": new FormControl('', [Validators.required]),
      "paymentstatus": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.ss.getAllList().then((gens: Customer[]) => {
      this.customers = gens;
      console.log("G-" + this.customers);
    });
    this.pss.getAllList().then((ags: Paymentstatus[]) => {
      this.paymentstatuses = ags;
      console.log("A-" + this.paymentstatuses);
    });
    this.is.getAllList().then((gens: Invoice[]) => {
      this.invoices = gens;
      console.log("G-" + this.invoices);
    });
    this.pms.getAllList().then((ags: Paymentmethod[]) => {
      this.paymentmethods = ags;
      console.log("A-" + this.paymentmethods);
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
    this.form.controls['amount'].setValidators([Validators.required]);
    // this.form.controls['remarks'].setValidators([Validators.required]);
    this.form.controls['invoice'].setValidators([Validators.required]);
    this.form.controls['customer'].setValidators([Validators.required]);
    this.form.controls['paymentmethod'].setValidators([Validators.required]);
    this.form.controls['paymentstatus'].setValidators([Validators.required]);

    this.form.get('invoice')?.valueChanges.subscribe((selectedInvoice) => {
      this.updateAmount(selectedInvoice);
    });


    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="date")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldcustomerpayment != undefined && control.valid) {
          // @ts-ignore
          if (value === this.customerpayment[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    this.loadForm();
  }

  loadForm(){
    this.oldcustomerpayment = undefined;
    this.form.reset();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_EXECUTIVE")) {
      this.enableButtons(true, false, false);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.cps.getAll(query)
      .then((prods: Customerpayment[]) => {
        this.customerpayments = prods;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.customerpayments);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let invoiceid = ssearchdata.ssinvoice;
    let customerid = ssearchdata.sscustomer;
    let paymentstatusid = ssearchdata.sspaymentstatus;
    let paymentmethodid = ssearchdata.sspaymentmethod;


    let query="";

    if(customerid!=null) query=query+"&customerid="+customerid;
    if(paymentstatusid!=null) query=query+"&paymentstatusid="+paymentstatusid;
    if(invoiceid!=null) query=query+"&invoiceid="+invoiceid;
    if(paymentmethodid!=null) query=query+"&paymentmethodid="+paymentmethodid;


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

  updateAmount(selectedInvoice: any) {
    console.log("Selected Invoice:", selectedInvoice);
    const totalAmountControl = this.form.get('amount');

    if (totalAmountControl) {
      if (selectedInvoice) {
        const totalAmount = selectedInvoice.paidamount;
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
        data: {heading: "Errors - Customerpayment Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.customerpayment = this.form.getRawValue();
      let proddata: string = "";
      proddata = proddata + "<br>Invoice number is : "+ this.customerpayment.invoice.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Customerpayment Add", message: "Are you sure to Add the following Customerpayment? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("CustomerpaymentService.add(emp)");
          this.cps.add(this.customerpayment).then((response: []|undefined) => {
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
              data: {heading: "Status -Customerpayment Add", message: addmessage}
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

  onTabChange(event: MatTabChangeEvent) {
  }


  fillForm(customerpayment:Customerpayment) {

    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_EXECUTIVE")) {
      this.enableButtons(false, true, true);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow=customerpayment;

    this.customerpayment = JSON.parse(JSON.stringify(customerpayment));
    this.oldcustomerpayment = JSON.parse(JSON.stringify(customerpayment));

    //@ts-ignore
    this.customerpayment.customer = this.customers.find(g => g.id === this.customerpayment.customer.id);
    //@ts-ignore
    this.customerpayment.paymentstatus = this.paymentstatuses.find(a => a.id === this.customerpayment.paymentstatus.id);
    //@ts-ignore
    this.customerpayment.paymentmethod = this.paymentmethods.find(a => a.id === this.customerpayment.paymentmethod.id);
    //@ts-ignore
    this.customerpayment.invoice = this.invoices.find(a => a.id === this.customerpayment.invoice.id);


    this.form.patchValue(this.customerpayment);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Customerpayment Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Customerpayment Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.customerpayment = this.form.getRawValue();
            //@ts-ignore
            this.customerpayment.id = this.oldcustomerpayment.id;
            this.cps.update(this.customerpayment).then((response: [] | undefined) => {
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
                data: {heading: "Status -Customerpayment Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Customerpayment Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Customerpayment Delete",
        message: "Are you sure to Delete folowing Customerpayment? <br> <br>" +
          this.customerpayment.id
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.cps.delete(this.customerpayment.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Customerpayment Delete ", message: delmessage}
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
