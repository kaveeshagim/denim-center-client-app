import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Material} from "../../../entity/material";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MaterialService} from "../../../service/materialservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Supplier} from "../../../entity/supplier";
import {SupplierService} from "../../../service/supplierservice";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent {

  columns: string[] = ['id', 'name', 'supplier', 'unitofmeasure', 'costperunit','description'];
  headers: string[] = ['Id', 'Name', 'Supplier', 'Unitofmeasure', 'Costperunit','Description'];
  binders: string[] = ['id', 'name', 'supplier.comapnyname', 'unitofmeasure', 'costperunit','description'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  material!: Material;

  oldmaterial!: Material|undefined;
  selectedrow: any;
  materials: Array<Material> = [];
  data!: MatTableDataSource<Material>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  suppliers: Array<Supplier> = [];

  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;
  regexes: any;
  uiassist:UiAssist;
  constructor(
    private ms: MaterialService,
    private sps: SupplierService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);


    this.ssearch = this.fb.group({
      "ssname": new FormControl(),
      "sssupplier": new FormControl(),



    });

    this.form = this.fb.group({
      //"id": new FormControl('', [Validators.required]),
      "name": new FormControl('', [Validators.required]),
      "unitofmeasure": new FormControl('', [Validators.required]),
      "costperunit": new FormControl('', [Validators.required]),
      "description": new FormControl('', ),
      "supplier": new FormControl('', [Validators.required]),


    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.sps.getAllList().then((sups: Supplier[]) => {
      this.suppliers = sups;
      console.log("S-" + this.suppliers);
    });

    this.rs.get('material').then((regs: []) => {
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
    this.form.controls['name'].setValidators([Validators.required]);
    this.form.controls['costperunit'].setValidators([Validators.required]);
    this.form.controls['unitofmeasure'].setValidators([Validators.required]);
    this.form.controls['description'].setValidators([Validators.required]);
    this.form.controls['supplier'].setValidators([Validators.required]);


    //Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="dob" || controlName=="doj")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldmaterial != undefined && control.valid) {
          // @ts-ignore
          if (value === this.material[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    //this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.oldmaterial = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    this.enableButtons(true, false, false);
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.ms.getAll(query)
      .then((prods: Material[]) => {
        this.materials = prods;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.materials);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let name = ssearchdata.ssname;
    let supplierid = ssearchdata.sssupplier;



    let query="";

    if(name!=null) query=query+"&name="+name;
    if (supplierid != null) query = query + "&supplierid=" + supplierid;


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

  /* selectImage(e:any):void{
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
  } */



  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Material Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.material = this.form.getRawValue();
      //console.log("Photo-Before"+this.material.photo);
      //this.material.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.material.photo);
      let matdata: string = "";
      // matdata = matdata + "<br>Id is : "+ this.material.id;
      matdata = matdata + "<br>Name is : "+ this.material.name;
      matdata = matdata + "<br>Name is : "+ this.material.supplier.companyname;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Material Add", message: "Are you sure to Add the following Material? <br> <br>"+ matdata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("MaterialService.add(emp)");
          this.ms.add(this.material).then((response: []|undefined) => {
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
              data: {heading: "Status -Material Add", message: addmessage}
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

  fillForm(material:Material) {

    this.enableButtons(false, true, true);
    this.selectedrow=material;

    this.material = JSON.parse(JSON.stringify(material));
    this.oldmaterial = JSON.parse(JSON.stringify(material));

    /* if (this.material.image != null) {
      this.imageempurl = btoa(this.ematerial.image);
      this.form.controls['image'].clearValidators();
    }else {
      this.clearImage();
    } */

   // this.material.image = "";
    //@ts-ignore
    this.material.supplier = this.suppliers.find(s => s.id === this.material.supplier.id);
    //@ts-ignore


    this.form.patchValue(this.material);
    this.form.markAsPristine();
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Material Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Material Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.material = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.material.image = btoa(this.imageempurl);
           // else this.material.image = this.oldmaterial.image;
            //@ts-ignore
            this.material.id = this.oldmaterial.id;
            this.ms.update(this.material).then((response: [] | undefined) => {
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
                data: {heading: "Status -Material Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Material Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Material Delete",
        message: "Are you sure to Delete folowing Material? <br> <br>" +
          this.material.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.ms.delete(this.material.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Material Delete ", message: delmessage}
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
