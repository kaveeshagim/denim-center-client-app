import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Grn} from "../../../entity/grn";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {GrnService} from "../../../service/grnservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Porder} from "../../../entity/porder";
import {Supplier} from "../../../entity/supplier";
import {Grnstatus} from "../../../entity/grnstatus";
import {PorderService} from "../../../service/porderservice";
import {SupplierService} from "../../../service/supplierservice";
import {GrnstatusService} from "../../../service/grnstatusservice";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-grn',
  templateUrl: './grn.component.html',
  styleUrls: ['./grn.component.css']
})
export class GrnComponent {

  columns: string[] = ['number', 'datecreated', 'totalamount', 'paidamount', 'remarks', 'porder', 'supplier', 'grnstatus'];
  headers: string[] = ['Number', 'Datecreated', 'Totalamount',  'Paidamount','Remarks', 'Porder', 'Supplier', 'Grnstatus'];
  binders: string[] = ['number', 'datecreated', 'totalamount', 'paidamount', 'remarks', 'porder.number', 'supplier.companyname', 'grnstatus.name'];



  public ssearch!: FormGroup;
  public form!: FormGroup;

  grn!: Grn;
  oldgrn!: Grn|undefined;

  selectedrow: any;
  grns: Array<Grn> = [];
  data!: MatTableDataSource<Grn>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  imageempurl: string = 'assets/default.png';

  porders: Array<Porder> = [];
  suppliers: Array<Supplier> = [];
  grnstatuses: Array<Grnstatus> = [];

  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private gs: GrnService,
    private ps: PorderService,
    private ss: SupplierService,
    private gss: GrnstatusService,
    private ts: TokenStorageService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssnumber": new FormControl(),
      "ssporder": new FormControl(),
      "sssupplier": new FormControl(),


    });

    this.form = this.fb.group({
      "number": new FormControl('', [Validators.required, Validators.pattern("^\\d{4}$")]),
      "datecreated": new FormControl('', [Validators.required]),
      "totalamount": new FormControl('', [Validators.required]),
      "paidamount": new FormControl('', [Validators.required]),
      "remarks": new FormControl('', ),
      "porder": new FormControl('', [Validators.required]),
      "supplier": new FormControl('', [Validators.required]),
      "grnstatus": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.ps.getAllList().then((pors: Porder[]) => {
      this.porders = pors;
      console.log("G-" + this.porders);
    });
    this.ss.getAllList().then((sups: Supplier[]) => {
      this.suppliers = sups;
      console.log("S-" + this.suppliers);
    });
    this.gss.getAllList().then((gsts: Grnstatus[]) => {
      this.grnstatuses = gsts;
      console.log("C-" + this.grnstatuses);
    });

    this.rs.get('grn').then((regs: []) => {
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
    this.form.controls['porder'].setValidators([Validators.required]);
    this.form.controls['supplier'].setValidators([Validators.required]);
    this.form.controls['grnstatus'].setValidators([Validators.required]);

    this.form.get('porder')?.valueChanges.subscribe((selectedPorder) => {
      this.updateSelection(selectedPorder);
    });


    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="datecreated")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldgrn != undefined && control.valid) {
          // @ts-ignore
          if (value === this.grn[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }


    this.loadForm();
  }

  loadForm(){
    this.oldgrn = undefined;
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
    this.gs.getAll(query)
      .then((prods: Grn[]) => {
        this.grns = prods;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.grns);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let number = ssearchdata.ssnumber;
    let porderid = ssearchdata.ssporder;
    let supplierid = ssearchdata.sssupplier;


    let query="";

    if(number!=null && number.trim()!="") query=query+"&number="+number;
    if(porderid!=null) query=query+"&porderid="+porderid;
    if(supplierid!=null) query=query+"&supplierid="+supplierid;


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

  updateSelection(selectedPorder: any) {
    this.updateTotalAmount(selectedPorder);
    this.updateSupplier(selectedPorder);
  }


  updateTotalAmount(selectedPorder: any) {
    console.log("Selected Porder:", selectedPorder);
    const totalAmountControl = this.form.get('totalamount');

    if (totalAmountControl) {
      if (selectedPorder) {
        const totalAmount = selectedPorder.totalprice;
        totalAmountControl.setValue(totalAmount);
      } else {
        totalAmountControl.reset();
      }
    }
  }
  updateSupplier(selectedPorder: any) {
    console.log("Selected Porder:", selectedPorder);
    const totalAmountControl = this.form.get('supplier');

    if (totalAmountControl) {
      if (selectedPorder) {
        const totalAmount = selectedPorder.supplier.companyname;
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
        data: {heading: "Errors - Grn Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.grn = this.form.getRawValue();
      let proddata: string = "";
      proddata = proddata + "<br>Number is : "+ this.grn.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Grn Add", message: "Are you sure to Add the following Grn? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          //console.log("GrnService.add(emp)");
          this.gs.add(this.grn).then((response: []|undefined) => {
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
              data: {heading: "Status -Grn Add", message: addmessage}
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
  fillForm(grn:Grn) {

    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_EXECUTIVE")) {
      this.enableButtons(false, true, true);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow=grn;

    this.grn = JSON.parse(JSON.stringify(grn));
    this.oldgrn = JSON.parse(JSON.stringify(grn));

    //@ts-ignore
    this.grn.porder = this.porders.find(p => p.id === this.grn.porder.id);
    //@ts-ignore
    this.grn.supplier = this.suppliers.find(s => s.id === this.grn.supplier.id);
    //@ts-ignore
    this.grn.grnstatus = this.grnstatuses.find(t => t.id === this.grn.grnstatus.id);


    this.form.patchValue(this.grn);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Grn Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Grn Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.grn = this.form.getRawValue();
            //@ts-ignore
            this.grn.id = this.oldgrn.id;
            this.gs.update(this.grn).then((response: [] | undefined) => {
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
                data: {heading: "Status -Grn Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Grn Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Grn Delete",
        message: "Are you sure to Delete folowing Grn? <br> <br>" +
          this.grn.number
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.gs.delete(this.grn.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Grn Delete ", message: delmessage}
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
