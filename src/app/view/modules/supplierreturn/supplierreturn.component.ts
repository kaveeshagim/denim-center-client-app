import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Supplierreturn} from "../../../entity/supplierreturn";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Supplier} from "../../../entity/supplier";
import {Grn} from "../../../entity/grn";
import {UiAssist} from "../../../util/ui/ui.assist";
import {SupplierreturnService} from "../../../service/supplierreturnservice";
import {SupplierService} from "../../../service/supplierservice";
import {GrnService} from "../../../service/grnservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";

@Component({
  selector: 'app-supplierreturn',
  templateUrl: './supplierreturn.component.html',
  styleUrls: ['./supplierreturn.component.css']
})
export class SupplierreturnComponent {

  columns: string[] = ['qty', 'date', 'returncost', 'reason', 'supplier', 'grn'];
  headers: string[] = ['Qty', 'Date', 'Returncost', 'Reason', 'Supplier', 'Grn'];
  binders: string[] = ['qty', 'date', 'returncost', 'reason', 'supplier.name', 'grn.number'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  supplierreturn!: Supplierreturn;
  oldsupplierreturn!: Supplierreturn|undefined;

  selectedrow: any;
  supplierreturns: Array<Supplierreturn> = [];
  data!: MatTableDataSource<Supplierreturn>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string = 'assets/default.png';

  suppliers: Array<Supplier> = [];
  grns: Array<Grn> = [];



  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private srs: SupplierreturnService,
    private ss: SupplierService,
    private gs: GrnService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssgrn": new FormControl(),
      "sssupplier": new FormControl(),


    });

    this.form = this.fb.group({
      "date": new FormControl('', [Validators.required]),
      "qty": new FormControl('', [Validators.required]),
      "reason": new FormControl('', ),
      "returncost": new FormControl('', [Validators.required]),
      "supplier": new FormControl('', [Validators.required]),
      "grn": new FormControl('', [Validators.required]),

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
    this.gs.getAllList().then((gens: Grn[]) => {
      this.grns = gens;
      console.log("G-" + this.grns);
    });


    //this.rs.get('supplierreturn').then((regs: []) => {
     // this.regexes = regs;
    //  console.log("R-" + this.regexes['number']['regex']);
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
    this.form.controls['qty'].setValidators([Validators.required]);
    this.form.controls['grn'].setValidators([Validators.required]);
    this.form.controls['supplier'].setValidators([Validators.required]);
    //this.form.controls['reason'].setValidators([Validators.required]);
    this.form.controls['returncost'].setValidators([Validators.required]);



    //Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="date")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldsupplierreturn != undefined && control.valid) {
          // @ts-ignore
          if (value === this.supplierreturn[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    //this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.oldsupplierreturn = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    this.enableButtons(true, false, false);
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.srs.getAll(query)
      .then((prods: Supplierreturn[]) => {
        this.supplierreturns = prods;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.supplierreturns);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let grnid = ssearchdata.ssgrn;
    let supplierid = ssearchdata.sssupplier;



    let query="";

    if(supplierid!=null) query=query+"&supplierid="+supplierid;
    if(grnid!=null) query=query+"&grnid="+grnid;



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

  getModi(element: Supplierreturn) {
    return element.number + '(' + element.name + ')';
  } */



  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Supplierreturn Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.supplierreturn = this.form.getRawValue();
      //console.log("Photo-Before"+this.supplierreturn.photo);
      //this.supplierreturn.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.supplierreturn.photo);
      let proddata: string = "";
      proddata = proddata + "<br>Id is : "+ this.supplierreturn.id;
      proddata = proddata + "<br>Number is : "+ this.supplierreturn.grn.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Supplierreturn Add", message: "Are you sure to Add the following Supplierreturn? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("SupplierreturnService.add(emp)");
          this.srs.add(this.supplierreturn).then((response: []|undefined) => {
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
              data: {heading: "Status -Supplierreturn Add", message: addmessage}
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


  fillForm(supplierreturn:Supplierreturn) {

    this.enableButtons(false, true, true);
    this.selectedrow=supplierreturn;

    this.supplierreturn = JSON.parse(JSON.stringify(supplierreturn));
    this.oldsupplierreturn = JSON.parse(JSON.stringify(supplierreturn));

    /*if (this.supplierreturn.image != null) {
    this.imageempurl = btoa(this.supplierreturn.image);
      this.form.controls['image'].clearValidators();
    }else {
     this.clearImage();
    }*/

    //this.supplierreturn.image = "";
    //@ts-ignore
    this.supplierreturn.supplier = this.suppliers.find(g => g.id === this.supplierreturn.supplier.id);
    //@ts-ignore
    this.supplierreturn.grn = this.grns.find(a => a.id === this.supplierreturn.grn.id);




    this.form.patchValue(this.supplierreturn);
    this.form.markAsPristine();
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Supplierreturn Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Supplierreturn Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.supplierreturn = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.supplierreturn.image = btoa(this.imageempurl);
            //else { // @ts-ignore
            // this.supplierreturn.image = this.oldsupplierreturn.image;
          //}
            // @ts-ignore
            this.supplierreturn.id = this.oldsupplierreturn.id;
            this.srs.update(this.supplierreturn).then((response: [] | undefined) => {
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
                data: {heading: "Status -Supplierreturn Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Supplierreturn Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Supplierreturn Delete",
        message: "Are you sure to Delete folowing Supplierreturn? <br> <br>" +
          this.supplierreturn.id
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.srs.delete(this.supplierreturn.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Supplierreturn Delete ", message: delmessage}
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
