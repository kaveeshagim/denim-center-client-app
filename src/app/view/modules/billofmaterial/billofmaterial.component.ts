import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Billofmaterial} from "../../../entity/billofmaterial";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Material} from "../../../entity/material";
import {Productionorder} from "../../../entity/productionorder";
import {UiAssist} from "../../../util/ui/ui.assist";
import {BillofmaterialService} from "../../../service/billofmaterialservice";
import {MaterialService} from "../../../service/materialservice";
import {ProductionorderService} from "../../../service/productionorderservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-billofmaterial',
  templateUrl: './billofmaterial.component.html',
  styleUrls: ['./billofmaterial.component.css']
})
export class BillofmaterialComponent {

  columns: string[] = ['qty', 'material', 'productionorder'];
  headers: string[] = ['Qty', 'Material', 'Productionorder'];
  binders: string[] = ['qty', 'material.name', 'productionorder.number'];



  public ssearch!: FormGroup;
  public form!: FormGroup;

  billofmaterial!: Billofmaterial;
  oldbillofmaterial!: Billofmaterial|undefined;

  selectedrow: any;
  billofmaterials: Array<Billofmaterial> = [];
  data!: MatTableDataSource<Billofmaterial>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  imageempurl: string = 'assets/default.png';

  materials: Array<Material> = [];
  productionorders: Array<Productionorder> = [];



  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private bs: BillofmaterialService,
    private ms: MaterialService,
    private pos: ProductionorderService,
    private rs: RegexService,
    private ts: TokenStorageService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssmaterial": new FormControl(),
      "ssproductionorder": new FormControl(),


    });

    this.form = this.fb.group({
      "qty": new FormControl('', [Validators.required]),
      "material": new FormControl('', [Validators.required]),
      "productionorder": new FormControl('', [Validators.required]),
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
    this.pos.getAllList().then((ags: Productionorder[]) => {
      this.productionorders = ags;
      console.log("A-" + this.productionorders);
    });


    this.rs.get('billofmaterial').then((regs: []) => {
      this.regexes = regs;
     // console.log("R-" + this.regexes['number']['regex']);
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
    this.form.controls['qty'].setValidators([Validators.required]);
    this.form.controls['material'].setValidators([Validators.required]);
    this.form.controls['productionorder'].setValidators([Validators.required]);

    //Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="duedate")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldbillofmaterial != undefined && control.valid) {
          // @ts-ignore
          if (value === this.billofmaterial[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }


    this.loadForm();
  }

  loadForm(){
    this.oldbillofmaterial = undefined;
    this.form.reset();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_MANAGER")) {
      this.enableButtons(true, false, false);
    } else {
      this.enableButtons(false, false, false);
    }

    this.selectedrow = null;
  }

  loadTable(query:string){
    this.bs.getAll(query)
      .then((prods: Billofmaterial[]) => {
        this.billofmaterials = prods;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.billofmaterials);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let materialid = ssearchdata.ssmaterial;
    let productionorderid = ssearchdata.ssproductionorder;


    let query="";

    if(materialid!=null) query=query+"&materialid="+materialid;
    if(productionorderid!=null) query=query+"&productionorderid="+productionorderid;


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
        data: {heading: "Errors - Billofmaterial Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.billofmaterial = this.form.getRawValue();
      let proddata: string = "";
      proddata = proddata + "<br>Production order number is : "+ this.billofmaterial.productionorder.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Billofmaterial Add", message: "Are you sure to Add the following Billofmaterial? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("BillofmaterialService.add(emp)");
          this.bs.add(this.billofmaterial).then((response: []|undefined) => {
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
              data: {heading: "Status -Billofmaterial Add", message: addmessage}
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
  fillForm(billofmaterial:Billofmaterial) {
    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_MANAGER")) {
      this.enableButtons(false, true, true);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow=billofmaterial;

    this.billofmaterial = JSON.parse(JSON.stringify(billofmaterial));
    this.oldbillofmaterial = JSON.parse(JSON.stringify(billofmaterial));

    //@ts-ignore
    this.billofmaterial.material = this.materials.find(g => g.id === this.billofmaterial.material.id);
    //@ts-ignore
    this.billofmaterial.productionorder = this.productionorderes.find(a => a.id === this.billofmaterial.productionorder.id);



    this.form.patchValue(this.billofmaterial);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Billofmaterial Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Billofmaterial Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.billofmaterial = this.form.getRawValue();
            //@ts-ignore
            this.billofmaterial.id = this.oldbillofmaterial.id;
            this.bs.update(this.billofmaterial).then((response: [] | undefined) => {
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
                data: {heading: "Status -Billofmaterial Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Billofmaterial Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Billofmaterial Delete",
        message: "Are you sure to Delete folowing Billofmaterial? <br> <br>" +
          this.billofmaterial.id
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.bs.delete(this.billofmaterial.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Billofmaterial Delete ", message: delmessage}
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
