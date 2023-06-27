import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Supplierpayment} from "../../../entity/supplierpayment";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Supplier} from "../../../entity/supplier";
import {Grn} from "../../../entity/grn";
import {Paymentmethod} from "../../../entity/paymentmethod";
import {Paymentstatus} from "../../../entity/paymentstatus";
import {UiAssist} from "../../../util/ui/ui.assist";
import {SupplierpaymentService} from "../../../service/supplierpaymentservice";
import {SupplierService} from "../../../service/supplierservice";
import {GrnService} from "../../../service/grnservice";
import {PaymentmethodService} from "../../../service/paymentmethodservice";
import {PaymentstatusService} from "../../../service/paymentstatusservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";

@Component({
  selector: 'app-supplierpayment',
  templateUrl: './supplierpayment.component.html',
  styleUrls: ['./supplierpayment.component.css']
})
export class SupplierpaymentComponent {

  columns: string[] = ['date', 'amount', 'remarks', 'supplier', 'grn', 'paymentmethod', 'paymentstatus'];
  headers: string[] = ['Date', 'Amount', 'Remarks', 'Supplier', 'Grn', 'Paymentmethod', 'Paymentstatus'];
  binders: string[] = ['date', 'amount', 'remarks', 'supplier.companyname', 'grn.number', 'paymentmethod.name', 'paymentstatus.name'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  supplierpayment!: Supplierpayment;
  oldsupplierpayment!: Supplierpayment|undefined;

  selectedrow: any;
  supplierpayments: Array<Supplierpayment> = [];
  data!: MatTableDataSource<Supplierpayment>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string = 'assets/default.png';

  suppliers: Array<Supplier> = [];
  grns: Array<Grn> = [];
  paymentmethods: Array<Paymentmethod> = [];
  paymentstatuses: Array<Paymentstatus> = [];



  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private sps: SupplierpaymentService,
    private ss: SupplierService,
    private gs: GrnService,
    private pms: PaymentmethodService,
    private pss: PaymentstatusService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssgrn": new FormControl(),
      "sssupplier": new FormControl(),
      "sspaymentstatus": new FormControl(),
      "sspaymentmethod": new FormControl(),


    });

    this.form = this.fb.group({
      "date": new FormControl('', [Validators.required]),
      "amount": new FormControl('', [Validators.required]),
      "remarks": new FormControl('', ),
      "supplier": new FormControl('', [Validators.required]),
      "grn": new FormControl('', [Validators.required]),
      "paymentmethod": new FormControl('', [Validators.required]),
      "paymentstatus": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.ss.getAllList().then((gens: Supplier[]) => {
      this.suppliers = gens;
      console.log("G-" + this.suppliers);
    });
    this.pss.getAllList().then((ags: Paymentstatus[]) => {
      this.paymentstatuses = ags;
      console.log("A-" + this.paymentstatuses);
    });
    this.gs.getAllList().then((gens: Grn[]) => {
      this.grns = gens;
      console.log("G-" + this.grns);
    });
    this.pms.getAllList().then((ags: Paymentmethod[]) => {
      this.paymentmethods = ags;
      console.log("A-" + this.paymentmethods);
    });

    //this.rs.get('supplierpayment').then((regs: []) => {
     // this.regexes = regs;
     // console.log("R-" + this.regexes['number']['regex']);
      this.createForm();
    //});

    this.createSearch();
  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createSearch(){ }

  createForm(){
    this.form.controls['date'].setValidators([Validators.required]);
    this.form.controls['amount'].setValidators([Validators.required]);
   // this.form.controls['remarks'].setValidators([Validators.required]);
    this.form.controls['grn'].setValidators([Validators.required]);
    this.form.controls['supplier'].setValidators([Validators.required]);
    this.form.controls['paymentmethod'].setValidators([Validators.required]);
    this.form.controls['paymentstatus'].setValidators([Validators.required]);

    this.form.get('grn')?.valueChanges.subscribe((selectedGrn) => {
      this.updateAmount(selectedGrn);
    });


   // Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="date")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldsupplierpayment != undefined && control.valid) {
          // @ts-ignore
          if (value === this.supplierpayment[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

   // this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.oldsupplierpayment = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    this.enableButtons(true, false, false);
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.sps.getAll(query)
      .then((prods: Supplierpayment[]) => {
        this.supplierpayments = prods;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.supplierpayments);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let grnid = ssearchdata.ssgrn;
    let supplierid = ssearchdata.sssupplier;
    let paymentstatusid = ssearchdata.sspaymentstatus;
    let paymentmethodid = ssearchdata.sspaymentmethod;


    let query="";

    if(supplierid!=null) query=query+"&supplierid="+supplierid;
    if(paymentstatusid!=null) query=query+"&paymentstatusid="+paymentstatusid;
    if(grnid!=null) query=query+"&grnid="+grnid;
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

  updateAmount(selectedGrn: any) {
    console.log("Selected Grn:", selectedGrn);
    const totalAmountControl = this.form.get('amount');

    if (totalAmountControl) {
      if (selectedGrn) {
        const totalAmount = selectedGrn.paidamount;
        totalAmountControl.setValue(totalAmount);
      } else {
        totalAmountControl.reset();
      }
    }
  }
  /*selectImage(e:any):void{
    if(e.target.files){
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload=(event: any)=>{this.imageempurl = event.target.result;
        this.form.controls['image'].clearValidators();
      }
    }
  }

  clearImage():void{
    this.imageempurl = 'assets/default.png';
    this.form.controls['image'].setErrors({'required': true });
  }

  getModi(element: Supplierpayment) {
    return element.number + '(' + element.name + ')';
  } */


  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Supplierpayment Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.supplierpayment = this.form.getRawValue();
      //console.log("Photo-Before"+this.supplierpayment.photo);
      //this.supplierpayment.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.supplierpayment.photo);
      let proddata: string = "";
      proddata = proddata + "<br>Number is : "+ this.supplierpayment.id;
      proddata = proddata + "<br>Name is : "+ this.supplierpayment.grn.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Supplierpayment Add", message: "Are you sure to Add the following Supplierpayment? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("SupplierpaymentService.add(emp)");
          this.sps.add(this.supplierpayment).then((response: []|undefined) => {
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
              data: {heading: "Status -Supplierpayment Add", message: addmessage}
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


  fillForm(supplierpayment:Supplierpayment) {

    this.enableButtons(false, true, true);
    this.selectedrow=supplierpayment;

    this.supplierpayment = JSON.parse(JSON.stringify(supplierpayment));
    this.oldsupplierpayment = JSON.parse(JSON.stringify(supplierpayment));

    /*if (this.supplierpayment.image != null) {
    this.imageempurl = btoa(this.supplierpayment.image);
      this.form.controls['image'].clearValidators();
    }else {
     this.clearImage();
    }*/

    //this.supplierpayment.image = "";
    //@ts-ignore
    this.supplierpayment.supplier = this.suppliers.find(g => g.id === this.supplierpayment.supplier.id);
    //@ts-ignore
    this.supplierpayment.paymentstatus = this.paymentstatuses.find(a => a.id === this.supplierpayment.paymentstatus.id);
    //@ts-ignore
    this.supplierpayment.paymentmethod = this.paymentmethods.find(a => a.id === this.supplierpayment.paymentmethod.id);
    //@ts-ignore
    this.supplierpayment.grn = this.grns.find(a => a.id === this.supplierpayment.grn.id);




    this.form.patchValue(this.supplierpayment);
    this.form.markAsPristine();
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Supplierpayment Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Supplierpayment Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.supplierpayment = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.supplierpayment.image = btoa(this.imageempurl);
            //else this.supplierpayment.image = this.oldsupplierpayment.image;
            //@ts-ignore
            this.supplierpayment.id = this.oldsupplierpayment.id;
            this.sps.update(this.supplierpayment).then((response: [] | undefined) => {
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
                data: {heading: "Status -Supplierpayment Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Supplierpayment Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Supplierpayment Delete",
        message: "Are you sure to Delete folowing Supplierpayment? <br> <br>" +
          this.supplierpayment.id
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.sps.delete(this.supplierpayment.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Supplierpayment Delete ", message: delmessage}
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
