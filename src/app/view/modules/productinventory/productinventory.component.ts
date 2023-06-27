import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Productinventory} from "../../../entity/productinventory";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Product} from "../../../entity/product";
import {UiAssist} from "../../../util/ui/ui.assist";
import {ProductinventoryService} from "../../../service/productinventoryservice";
import {ProductService} from "../../../service/productservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";

@Component({
  selector: 'app-productinventory',
  templateUrl: './productinventory.component.html',
  styleUrls: ['./productinventory.component.css']
})
export class ProductinventoryComponent {

  columns: string[] = ['number', 'qty', 'updateddate', 'reorderlevel', 'product'];
  headers: string[] = ['Number', 'Qty', 'Updateddate', 'Reorderlevel', 'Product'];
  binders: string[] = ['number', 'qty', 'updateddate', 'reorderlevel', 'product.code'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  productinventory!: Productinventory;
  oldproductinventory!: Productinventory|undefined;

  selectedrow: any;
  productinventories: Array<Productinventory> = [];
  data!: MatTableDataSource<Productinventory>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string = 'assets/default.png';

  products: Array<Product> = [];

  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private pis: ProductinventoryService,
    private ps: ProductService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssnumber": new FormControl(),
      "ssproduct": new FormControl(),


    });

    this.form = this.fb.group({
      "number": new FormControl('', [Validators.required, Validators.pattern("^\\d{4}$")]),
      "qty": new FormControl('', [Validators.required]),
      "updateddate": new FormControl('', [Validators.required]),
      "reorderlevel": new FormControl('', [Validators.required]),
      "product": new FormControl('', [Validators.required]),

    }, {updateOn: 'change' });
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.ps.getAllList().then((gens: Product[]) => {
      this.products = gens;
      console.log("G-" + this.products);
    });


    this.rs.get('productinventory').then((regs: []) => {
      this.regexes = regs;
      console.log("R-" + this.regexes['number']['regex']);
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
    this.form.controls['number'].setValidators([Validators.required,Validators.pattern(this.regexes['number']['regex'])]);
    this.form.controls['qty'].setValidators([Validators.required]);
    this.form.controls['reorderlevel'].setValidators([Validators.required]);
    this.form.controls['updateddate'].setValidators([Validators.required]);
    this.form.controls['product'].setValidators([Validators.required]);


    //Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="updateddate")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldproductinventory != undefined && control.valid) {
          // @ts-ignore
          if (value === this.productinventory[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    //this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.oldproductinventory = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    this.enableButtons(true, false, false);
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.pis.getAll(query)
      .then((prods: Productinventory[]) => {
        this.productinventories = prods;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.productinventories);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let number = ssearchdata.ssnumber;
    let productid = ssearchdata.ssproduct;

    let query="";

    if(number!=null && number.trim()!="") query=query+"&number="+number;
    if(productid!=null) query=query+"&productid="+productid;


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

  getModi(element: Productinventory) {
    return element.number + '(' + element.name + ')';
  }*/



  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Productinventory Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.productinventory = this.form.getRawValue();
      //console.log("Photo-Before"+this.productinventory.photo);
      //this.productinventory.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.productinventory.photo);
      let proddata: string = "";
      proddata = proddata + "<br>Number is : "+ this.productinventory.number;
      proddata = proddata + "<br>Name is : "+ this.productinventory.product.name;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Productinventory Add", message: "Are you sure to Add the following Productinventory? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("ProductinventoryService.add(emp)");
          this.pis.add(this.productinventory).then((response: []|undefined) => {
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
              data: {heading: "Status -Productinventory Add", message: addmessage}
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


  fillForm(productinventory:Productinventory) {

    this.enableButtons(false, true, true);
    this.selectedrow=productinventory;

    this.productinventory = JSON.parse(JSON.stringify(productinventory));
    this.oldproductinventory = JSON.parse(JSON.stringify(productinventory));

    /*if (this.productinventory.image != null) {
      this.imageempurl = btoa(this.productinventory.image);
      this.form.controls['image'].clearValidators();
    }else {
      this.clearImage();
    }*/

    //this.productinventory.image = "";
    //@ts-ignore
    this.productinventory.product = this.products.find(g => g.id === this.productinventory.product.id);


    this.form.patchValue(this.productinventory);
    this.form.markAsPristine();
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Productinventory Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Productinventory Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.productinventory = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.productinventory.image = btoa(this.imageempurl);
            //else this.productinventory.image = this.oldproductinventory.image;
            //@ts-ignore
            this.productinventory.id = this.oldproductinventory.id;
            this.pis.update(this.productinventory).then((response: [] | undefined) => {
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
                data: {heading: "Status -Productinventory Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Productinventory Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Productinventory Delete",
        message: "Are you sure to Delete folowing Productinventory? <br> <br>" +
          this.productinventory.number
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.pis.delete(this.productinventory.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Productinventory Delete ", message: delmessage}
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
