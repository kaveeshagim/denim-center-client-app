import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Porder} from "../../../entity/porder";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {PorderService} from "../../../service/porderservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Supplier} from "../../../entity/supplier";
import {Orderstatus} from "../../../entity/orderstatus";
import {SupplierService} from "../../../service/supplierservice";
import {OrderstatusService} from "../../../service/orderstatusservice";
import {Material} from "../../../entity/material";
import {MaterialService} from "../../../service/materialservice";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-purchaseorder',
  templateUrl: './porder.component.html',
  styleUrls: ['./porder.component.css']
})
export class PorderComponent {

  columns: string[] = ['number', 'qty', 'unitprice', 'totalprice', 'orderdate', 'duedate', 'remarks', 'supplier', 'orderstatus', 'material'];
  headers: string[] = ['Number', 'Qty', 'Unitprice', 'Totalprice', 'Orderdate', 'Duedate', 'Remarks', 'Supplier', 'Orderstatus', 'Material'];
  binders: string[] = ['number', 'qty', 'unitprice', 'totalprice', 'orderdate', 'duedate', 'remarks', 'supplier.companyname', 'orderstatus.name', 'material.name'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  porder!: Porder;
  oldporder!: Porder|undefined;

  selectedrow: any;
  porders: Array<Porder> = [];
  data!: MatTableDataSource<Porder>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  imageempurl: string = 'assets/default.png';

  suppliers: Array<Supplier> = [];
  orderstatuses: Array<Orderstatus> = [];
  materials: Array<Material> = [];


  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private ps: PorderService,
    private ss: SupplierService,
    private os: OrderstatusService,
    private ms: MaterialService,
    private ts: TokenStorageService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);


    this.ssearch = this.fb.group({
      "ssnumber": new FormControl(),
      "sssupplier": new FormControl(),
      "ssorderstatus": new FormControl(),
      "ssmaterial": new FormControl(),

    });

    this.form = this.fb.group({
      "number": new FormControl('', [Validators.required, Validators.pattern("^\\d{4}$")]),
      "qty": new FormControl('', [Validators.required]),
      "unitprice": new FormControl('', [Validators.required]),
      "totalprice": new FormControl('', [Validators.required]),
      "orderdate": new FormControl('', [Validators.required]),
      "duedate": new FormControl('', [Validators.required]),
      "remarks": new FormControl('', ),
      "supplier": new FormControl('', [Validators.required]),
      "orderstatus": new FormControl('', [Validators.required]),
      "material": new FormControl('', [Validators.required]),

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
    this.os.getAllList().then((ags: Orderstatus[]) => {
      this.orderstatuses = ags;
      console.log("A-" + this.orderstatuses);
    });
    this.ms.getAllList().then((mats: Material[]) => {
      this.materials = mats;
      console.log("M-" + this.materials);
    });


    this.rs.get('porder').then((regs: []) => {
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
    this.form.controls['unitprice'].setValidators([Validators.required]);
    this.form.controls['totalprice'].setValidators([Validators.required]);
    this.form.controls['orderdate'].setValidators([Validators.required]);
    this.form.controls['duedate'].setValidators([Validators.required]);
    //this.form.controls['remarks'].setValidators([Validators.required]);
    this.form.controls['supplier'].setValidators([Validators.required]);
    this.form.controls['orderstatus'].setValidators([Validators.required]);
    this.form.controls['material'].setValidators([Validators.required]);

    this.form.get('material')?.valueChanges.subscribe((selectedMaterial) => {
      this.updateUnitPrice(selectedMaterial);
    });

    //Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="orderdate" || controlName=="duedate")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldporder != undefined && control.valid) {
          // @ts-ignore
          if (value === this.porder[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    this.loadForm();
  }

  loadForm(){
    this.oldporder = undefined;
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
    this.ps.getAll(query)
      .then((prods: Porder[]) => {
        this.porders = prods;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.porders);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let number = ssearchdata.ssnumber;
    let supplierid = ssearchdata.sssupplier;
    let orderstatusid = ssearchdata.ssorderstatus;
    let materialid = ssearchdata.ssmaterial;

    let query="";

    if(number!=null && number.trim()!="") query=query+"&number="+number;
    if(supplierid!=null) query=query+"&supplierid="+supplierid;
    if(orderstatusid!=null) query=query+"&orderstatusid="+orderstatusid;
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

  calculateTotalPrice() {
    const qty = this.form.get('qty')?.value;
    const unitPrice = this.form.get('unitprice')?.value;
    if (qty !== null && unitPrice !== null) {
      const totalPrice = qty * unitPrice;
      this.form.patchValue({ totalprice: totalPrice });
    }
  }

  updateUnitPrice(selectedMaterial: any) {
    console.log("Selected Material:", selectedMaterial);
    const unitPriceControl = this.form.get('unitprice');

    if (unitPriceControl) {
      if (selectedMaterial) {
        const unitPrice = selectedMaterial.costperunit;
        unitPriceControl.setValue(unitPrice);
      } else {
        unitPriceControl.reset();
      }
    }
  }

  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Porder Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.porder = this.form.getRawValue();
      let proddata: string = "";
      proddata = proddata + "<br>Number is : "+ this.porder.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Porder Add", message: "Are you sure to Add the following Porder? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("PorderService.add(emp)");
          this.ps.add(this.porder).then((response: []|undefined) => {
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
              data: {heading: "Status -Porder Add", message: addmessage}
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

  fillForm(porder:Porder) {

    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_EXECUTIVE")) {
      this.enableButtons(false, true, true);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow=porder;

    this.porder = JSON.parse(JSON.stringify(porder));
    this.oldporder = JSON.parse(JSON.stringify(porder));

    //@ts-ignore
    this.porder.supplier = this.suppliers.find(g => g.id === this.porder.supplier.id);
    //@ts-ignore
    this.porder.orderstatus = this.orderstatuses.find(a => a.id === this.porder.orderstatus.id);
    //@ts-ignore
    this.porder.material = this.materials.find(m => m.id === this.porder.material.id);


    this.form.patchValue(this.porder);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Porder Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Porder Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.porder = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.porder.image = btoa(this.imageempurl);
            //else this.porder.image = this.oldporder.image;
            //@ts-ignore
            this.porder.id = this.oldporder.id;
            this.ps.update(this.porder).then((response: [] | undefined) => {
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
                data: {heading: "Status -Porder Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Porder Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Porder Delete",
        message: "Are you sure to Delete folowing Porder? <br> <br>" +
          this.porder.number
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.ps.delete(this.porder.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Porder Delete ", message: delmessage}
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
