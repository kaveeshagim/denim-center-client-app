import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Supplier} from "../../../entity/supplier";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {SupplierService} from "../../../service/supplierservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css']
})
export class SupplierComponent {

  columns: string[] = ['id', 'companyname', 'name', 'address', 'nic', 'mobile', 'email', 'city', 'dateadded'];
  headers: string[] = ['Id', 'Companyname', 'Name', 'Address', 'Nic', 'Mobile', 'Email', 'City', 'Dateadded'];
  binders: string[] = ['id', 'companyname', 'name', 'address', 'nic', 'mobile', 'email', 'city', 'dateadded'];


  public ssearch!: FormGroup;
  public form!: FormGroup;

  supplier!: Supplier;

  oldsupplier!: Supplier|undefined;
  selectedrow: any;
  suppliers: Array<Supplier> = [];
  data!: MatTableDataSource<Supplier>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;


  regexes: any;
  uiassist:UiAssist;
  constructor(
    private ss: SupplierService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);


    this.ssearch = this.fb.group({
      "sscompanyname": new FormControl(),
      "ssname": new FormControl(),
      "ssnic": new FormControl(),
      "ssmobile": new FormControl(),


    });

    this.form = this.fb.group({
      //"id": new FormControl('', [Validators.required]),
      "companyname": new FormControl('', [Validators.required]),
      "name": new FormControl('', [Validators.required]),
      "address": new FormControl('', [Validators.required]),
      "nic": new FormControl('', [Validators.required, Validators.pattern("^(([\\d]{9}[vVxX])|([\\d]{12}))$")]),
      "mobile": new FormControl('', [Validators.required, Validators.pattern("^0\\d{9}$")]),
      "email": new FormControl('', [Validators.required]),
      "city": new FormControl('', [Validators.required]),
      "dateadded": new FormControl('', [Validators.required]),

    }, {updateOn: 'change' });
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.rs.get('supplier').then((regs: []) => {
    this.regexes = regs;
    //console.log("R-" + this.regexes['number']['regex']);
    this.createForm();
    });

    this.createSearch();
  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createSearch(){ }

  createForm(){
   // this.form.controls['id'].setValidators([Validators.required]);
    this.form.controls['companyname'].setValidators([Validators.required]);
    this.form.controls['name'].setValidators([Validators.required]);
    this.form.controls['address'].setValidators([Validators.required]);
    this.form.controls['nic'].setValidators([Validators.required,Validators.pattern(this.regexes['nic']['regex'])]);
    this.form.controls['mobile'].setValidators([Validators.required,Validators.pattern(this.regexes['mobile']['regex'])]);
    this.form.controls['email'].setValidators([Validators.required]);
    this.form.controls['city'].setValidators([Validators.required]);
    this.form.controls['dateadded'].setValidators([Validators.required]);

    //Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="dateadded")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldsupplier != undefined && control.valid) {
          // @ts-ignore
          if (value === this.supplier[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    //this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.oldsupplier = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    this.enableButtons(true, false, false);
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.ss.getAll(query)
      .then((prods: Supplier[]) => {
        this.suppliers = prods;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.suppliers);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let companyname = ssearchdata.sscompanyname;
    let name = ssearchdata.ssname;
    let nic = ssearchdata.ssnic;
    let mobile = ssearchdata.ssmobile;


    let query="";

    if(companyname!=null) query=query+"&companyname="+companyname;
    if(name!=null) query=query+"&name="+name;
    if(nic!=null) query=query+"&nic="+nic;
    if(mobile!=null) query=query+"&mobile="+mobile;

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
        data: {heading: "Errors - Supplier Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.supplier = this.form.getRawValue();
      //console.log("Photo-Before"+this.supplier.photo);
      //this.supplier.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.supplier.photo);
      let supdata: string = "";
     // supdata = supdata + "<br>Id is : "+ this.supplier.id;
      supdata = supdata + "<br>Company Name is : "+ this.supplier.companyname;
      supdata = supdata + "<br>Name is : "+ this.supplier.name;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Supplier Add", message: "Are you sure to Add the following Supplier? <br> <br>"+ supdata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("SupplierService.add(emp)");
          this.ss.add(this.supplier).then((response: []|undefined) => {
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
              data: {heading: "Status -Supplier Add", message: addmessage}
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

  fillForm(supplier:Supplier) {

    this.enableButtons(false, true, true);
    this.selectedrow=supplier;

    this.supplier = JSON.parse(JSON.stringify(supplier));
    this.oldsupplier = JSON.parse(JSON.stringify(supplier));

    /* if (this.supplier.image != null) {
      this.imageempurl = btoa(this.supplier.image);
      this.form.controls['image'].clearValidators();
    }else {
      this.clearImage();
    } */

   /*  this.supplier.image = "";
    //@ts-ignore
    this.supplier.gender = this.genders.find(g => g.id === this.supplier.gender.id);
    //@ts-ignore
    this.supplier.department = this.departments.find(d => d.id === this.supplier.department.id);
    //@ts-ignore
    this.supplier.empstatus = this.empstatuses.find(s => s.id === this.supplier.empstatus.id); */

    this.form.patchValue(this.supplier);
    this.form.markAsPristine();
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Supplier Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Supplier Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.supplier = this.form.getRawValue();
           // if (this.form.controls['image'].dirty) this.supplier.image = btoa(this.imageempurl);
            //else this.supplier.image = this.oldsupplier.image;
            //@ts-ignore
            this.supplier.id = this.oldsupplier.id;
            this.ss.update(this.supplier).then((response: [] | undefined) => {
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
                data: {heading: "Status -Supplier Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Supplier Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Supplier Delete",
        message: "Are you sure to Delete folowing Supplier? <br> <br>" +
          this.supplier.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.ss.delete(this.supplier.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Supplier Delete ", message: delmessage}
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
