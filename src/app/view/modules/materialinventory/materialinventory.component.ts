import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Material} from "../../../entity/material";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Supplier} from "../../../entity/supplier";
import {UiAssist} from "../../../util/ui/ui.assist";
import {SupplierService} from "../../../service/supplierservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Materialinventory} from "../../../entity/materialinventory";
import {Agecategory} from "../../../entity/agecategory";
import {Color} from "../../../entity/color";
import {Size} from "../../../entity/size";
import {Type} from "../../../entity/type";
import {MaterialinventoryService} from "../../../service/materialinventoryservice";
import {MaterialService} from "../../../service/materialservice";
import {AgecategoryService} from "../../../service/agecategoryservice";
import {ColorService} from "../../../service/colorservice";
import {SizeService} from "../../../service/sizeservice";
import {TypeService} from "../../../service/typeservice";
import {Movementtype} from "../../../entity/movementtype";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-materialinventory',
  templateUrl: './materialinventory.component.html',
  styleUrls: ['./materialinventory.component.css']
})
export class MaterialinventoryComponent {


  columns: string[] = ['number', 'qty', 'updateddate', 'reorderlevel', 'material'];
  headers: string[] = ['Number', 'Qty', 'Updateddate', 'Reorderlevel', 'Material'];
  binders: string[] = ['number', 'qty', 'updateddate', 'reorderlevel', 'material.name'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  materialinventory!: Materialinventory;
  oldmaterialinventory!: Materialinventory|undefined;


  selectedrow: any;
  materialinventories: Array<Materialinventory> = [];
  data!: MatTableDataSource<Materialinventory>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  imageempurl: string = 'assets/default.png';

  materials: Array<Material> = [];

  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private mis: MaterialinventoryService,
    private ms: MaterialService,
    private rs: RegexService,
    private ts: TokenStorageService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssnumber": new FormControl(),
      "ssmaterial": new FormControl(),


    });

    this.form = this.fb.group({
      "number": new FormControl('', [Validators.required, Validators.pattern("^\\d{4}$")]),
      "qty": new FormControl('', [Validators.required]),
      "updateddate": new FormControl('', [Validators.required]),
      "reorderlevel": new FormControl('', [Validators.required]),
      "material": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.ms.getAllList().then((gens: Material[]) => {
      this.materials = gens;
      console.log("G-" + this.materials);
    });


    this.rs.get('materialinventory').then((regs: []) => {
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
    this.form.controls['qty'].setValidators([Validators.required]);
    this.form.controls['reorderlevel'].setValidators([Validators.required]);
    this.form.controls['updateddate'].setValidators([Validators.required]);
    this.form.controls['material'].setValidators([Validators.required]);


    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="updateddate")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldmaterialinventory != undefined && control.valid) {
          // @ts-ignore
          if (value === this.materialinventory[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    this.loadForm();
  }

  loadForm(){
    this.oldmaterialinventory = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_MANAGER")) {
      this.enableButtons(true, false, false);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.mis.getAll(query)
      .then((prods: Materialinventory[]) => {
        this.materialinventories = prods;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.materialinventories);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let number = ssearchdata.ssnumber;
    let materialid = ssearchdata.ssmaterial;

    let query="";

    if(number!=null && number.trim()!="") query=query+"&number="+number;
    if(materialid!=null) query=query+"&materialid="+materialid;


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
        data: {heading: "Errors - Materialinventory Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.materialinventory = this.form.getRawValue();
      let proddata: string = "";
      proddata = proddata + "<br>Material Inventory number is : "+ this.materialinventory.number;
      proddata = proddata + "<br>Material name is : "+ this.materialinventory.material.name;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Materialinventory Add", message: "Are you sure to Add the following Materialinventory? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("MaterialinventoryService.add(emp)");
          this.mis.add(this.materialinventory).then((response: []|undefined) => {
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
              data: {heading: "Status -Materialinventory Add", message: addmessage}
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

  fillForm(materialinventory:Materialinventory) {

    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_MANAGER")) {
      this.enableButtons(false, true, true);
    } else {
      this.enableButtons(false, true, true);
    }
    this.selectedrow=materialinventory;

    this.materialinventory = JSON.parse(JSON.stringify(materialinventory));
    this.oldmaterialinventory = JSON.parse(JSON.stringify(materialinventory));

    //@ts-ignore
    this.materialinventory.material = this.materials.find(g => g.id === this.materialinventory.material.id);

    this.form.patchValue(this.materialinventory);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Materialinventory Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Materialinventory Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.materialinventory = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.materialinventory.image = btoa(this.imageempurl);
            //else this.materialinventory.image = this.oldmaterialinventory.image;
            //@ts-ignore
            this.materialinventory.id = this.oldmaterialinventory.id;
            this.mis.update(this.materialinventory).then((response: [] | undefined) => {
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
                data: {heading: "Status -Materialinventory Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Materialinventory Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Materialinventory Delete",
        message: "Are you sure to Delete folowing Materialinventory? <br> <br>" +
          this.materialinventory.number
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.mis.delete(this.materialinventory.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Materialinventory Delete ", message: delmessage}
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
