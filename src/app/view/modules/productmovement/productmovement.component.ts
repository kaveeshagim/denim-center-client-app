import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Productmovement} from "../../../entity/productmovement";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Product} from "../../../entity/product";
import {UiAssist} from "../../../util/ui/ui.assist";
import {ProductmovementService} from "../../../service/productmovementservice";
import {ProductService} from "../../../service/productservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Movementtype} from "../../../entity/movementtype";
import {Productinventory} from "../../../entity/productinventory";
import {ProductinventoryService} from "../../../service/productinventoryservice";
import {MovementtypeService} from "../../../service/movementtypeservice";

@Component({
  selector: 'app-productmovement',
  templateUrl: './productmovement.component.html',
  styleUrls: ['./productmovement.component.css']
})
export class ProductmovementComponent {

  columns: string[] = ['qty', 'date', 'remarks', 'productinventory', 'movementtype'];
  headers: string[] = ['Qty', 'Date', 'Remarks', 'Productinventory', 'Movementtype'];
  binders: string[] = ['qty', 'date', 'remarks', 'productinventory.number', 'movementtype.name'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  productmovement!: Productmovement;
  oldproductmovement!: Productmovement|undefined;

  selectedrow: any;
  productmovements: Array<Productmovement> = [];
  data!: MatTableDataSource<Productmovement>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string = 'assets/default.png';

  productinventories: Array<Productinventory> = []
  movementtypes: Array<Movementtype> = [];


  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private pms: ProductmovementService,
    private pis: ProductinventoryService,
    private mts: MovementtypeService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssproductinventory": new FormControl(),
      "ssmovementtype": new FormControl(),


    });

    this.form = this.fb.group({
      "qty": new FormControl('', [Validators.required]),
      "date": new FormControl('', [Validators.required]),
      "remarks": new FormControl('', [Validators.required]),
      "productinventory": new FormControl('', [Validators.required]),
      "movementtype": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.pis.getAllList().then((gens: Productinventory[]) => {
      this.productinventories = gens;
      console.log("G-" + this.productinventories);
    });

    this.mts.getAllList().then((gens: Movementtype[]) => {
      this.movementtypes = gens;
      console.log("G-" + this.movementtypes);
    });


      this.createForm();


    this.createSearch();
  }

  createView() {
    this.imageurl = 'assets/pending.gif';
    this.loadTable("");
  }

  createSearch(){ }

  createForm(){
    this.form.controls['qty'].setValidators([Validators.required]);
    //this.form.controls['remarks'].setValidators([Validators.required]);
    this.form.controls['date'].setValidators([Validators.required]);
    this.form.controls['productinventory'].setValidators([Validators.required]);
    this.form.controls['movementtype'].setValidators([Validators.required]);


    //Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="date")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldproductmovement != undefined && control.valid) {
          // @ts-ignore
          if (value === this.productmovement[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    //this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.oldproductmovement = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    this.enableButtons(true, false, false);
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.pms.getAll(query)
      .then((prods: Productmovement[]) => {
        this.productmovements = prods;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.productmovements);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let productinventoryid = ssearchdata.ssproductinventory;
    let movementtypeid = ssearchdata.ssmovementtype;

    let query="";

    if(movementtypeid!=null) query=query+"&movementtypeid="+movementtypeid;
    if(productinventoryid!=null) query=query+"&productinventoryid="+productinventoryid;


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

  getModi(element: Productmovement) {
    return element.number + '(' + element.name + ')';
  }*/



  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Productmovement Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.productmovement = this.form.getRawValue();
      //console.log("Photo-Before"+this.productmovement.photo);
      //this.productmovement.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.productmovement.photo);
      let proddata: string = "";
      proddata = proddata + "<br>Number is : "+ this.productmovement.productinventory.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Productmovement Add", message: "Are you sure to Add the following Productmovement? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("ProductmovementService.add(emp)");
          this.pms.add(this.productmovement).then((response: []|undefined) => {
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
              data: {heading: "Status -Productmovement Add", message: addmessage}
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


  fillForm(productmovement:Productmovement) {

    this.enableButtons(false, true, true);
    this.selectedrow=productmovement;

    this.productmovement = JSON.parse(JSON.stringify(productmovement));
    this.oldproductmovement = JSON.parse(JSON.stringify(productmovement));

    /*if (this.productmovement.image != null) {
      this.imageempurl = btoa(this.productmovement.image);
      this.form.controls['image'].clearValidators();
    }else {
      this.clearImage();
    }*/

    //this.productmovement.image = "";
    //@ts-ignore
    this.productmovement.productinventory = this.productinventories.find(g => g.id === this.productmovement.productinventory.id);
    //@ts-ignore
    this.productmovement.movementtype = this.movementtypes.find(t => t.id === this.productmovement.movementtype.id);


    this.form.patchValue(this.productmovement);
    this.form.markAsPristine();
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Productmovement Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Productmovement Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.productmovement = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.productmovement.image = btoa(this.imageempurl);
            //else this.productmovement.image = this.oldproductmovement.image;
            //@ts-ignore
            this.productmovement.id = this.oldproductmovement.id;
            this.pms.update(this.productmovement).then((response: [] | undefined) => {
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
                data: {heading: "Status -Productmovement Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Productmovement Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Productmovement Delete",
        message: "Are you sure to Delete folowing Productmovement? <br> <br>" +
          this.productmovement.id
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.pms.delete(this.productmovement.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Productmovement Delete ", message: delmessage}
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
