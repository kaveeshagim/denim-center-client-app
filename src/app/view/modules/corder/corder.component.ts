import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Corder} from "../../../entity/corder";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Customer} from "../../../entity/customer";
import {Orderstatus} from "../../../entity/orderstatus";
import {UiAssist} from "../../../util/ui/ui.assist";
import {CustomerService} from "../../../service/customerservice";
import {OrderstatusService} from "../../../service/orderstatusservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {CorderService} from "../../../service/corderservice";
import { Product } from 'src/app/entity/product';
import {ProductService} from "../../../service/productservice";

@Component({
  selector: 'app-customerorder',
  templateUrl: './corder.component.html',
  styleUrls: ['./corder.component.css']
})
export class CorderComponent {

  columns: string[] = ['number', 'qty', 'unitprice', 'totalprice', 'product','orderdate', 'duedate', 'remarks', 'customer', 'orderstatus'];
  headers: string[] = ['Number', 'Qty', 'UnitPrice', 'TotalPrice', 'Product', 'Orderdate', 'Duedate',  'Remarks', 'Customer', 'Orderstatus'];
  binders: string[] = ['number', 'qty', 'unitprice', 'totalprice', 'product.code','orderdate', 'duedate', 'remarks', 'customer.companyname', 'orderstatus.name'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  corder!: Corder;
  oldcorder!: Corder|undefined;

  selectedrow: any;
  corders: Array<Corder> = [];
  data!: MatTableDataSource<Corder>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string = 'assets/default.png';

  customers: Array<Customer> = [];
  orderstatuses: Array<Orderstatus> = [];
  products: Array<Product> = [];


  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private os: CorderService,
    private cs: CustomerService,
    private oss: OrderstatusService,
    private ps: ProductService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);


    this.ssearch = this.fb.group({
      "ssnumber": new FormControl(),
      "sscustomer": new FormControl(),
      "ssorderstatus": new FormControl(),
      "ssproduct": new FormControl,

    });

    this.form = this.fb.group({
      "number": new FormControl('', [Validators.required, Validators.pattern("^\\d{4}$")]),
      "qty": new FormControl('', [Validators.required]),
      "unitprice": new FormControl('', [Validators.required]),
      "totalprice": new FormControl('', [Validators.required]),
      "orderdate": new FormControl('', [Validators.required]),
      "duedate": new FormControl('', [Validators.required]),
      "remarks": new FormControl('', ),
      "customer": new FormControl('', [Validators.required]),
      "orderstatus": new FormControl('', [Validators.required]),
      "product": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.cs.getAllList().then((gens: Customer[]) => {
      this.customers = gens;
      console.log("G-" + this.customers);
    });
    this.oss.getAllList().then((ags: Orderstatus[]) => {
      this.orderstatuses = ags;
      console.log("A-" + this.orderstatuses);
    });
    this.ps.getAllList().then((prods: Product[]) => {
      this.products = prods;
      console.log("P-" + this.products);
    });


    this.rs.get('corder').then((regs: []) => {
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
    this.form.controls['unitprice'].setValidators([Validators.required]);
    this.form.controls['totalprice'].setValidators([Validators.required]);
    this.form.controls['orderdate'].setValidators([Validators.required]);
    this.form.controls['duedate'].setValidators([Validators.required]);
    //this.form.controls['remarks'].setValidators([Validators.required]);
    this.form.controls['customer'].setValidators([Validators.required]);
    this.form.controls['orderstatus'].setValidators([Validators.required]);
    this.form.controls['product'].setValidators([Validators.required]);


    this.form.get('product')?.valueChanges.subscribe((selectedProduct) => {
      this.updateUnitPrice(selectedProduct);
    });
   // Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="orderdate" || controlName=="duedate")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldcorder != undefined && control.valid) {
          // @ts-ignore
          if (value === this.corder[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

   // this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.oldcorder = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    this.enableButtons(true, false, false);
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.os.getAll(query)
      .then((prods: Corder[]) => {
        this.corders = prods;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.corders);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let number = ssearchdata.ssnumber;
    let customerid = ssearchdata.sscustomer;
    let orderstatusid = ssearchdata.ssorderstatus;
    let productid = ssearchdata.ssproduct;

    let query="";

    if(number!=null && number.trim()!="") query=query+"&number="+number;
    if(customerid!=null) query=query+"&customerid="+customerid;
    if(orderstatusid!=null) query=query+"&orderstatusid="+orderstatusid;
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

  calculateTotalPrice() {
    const qty = this.form.get('qty')?.value;
    const unitPrice = this.form.get('unitprice')?.value;
    if (qty !== null && unitPrice !== null) {
      const totalPrice = qty * unitPrice;
      this.form.patchValue({ totalprice: totalPrice });
    }
  }

  updateUnitPrice(selectedProduct: any) {
    console.log("Selected Product:", selectedProduct);
    const unitPriceControl = this.form.get('unitprice');

    if (unitPriceControl) {
      if (selectedProduct) {
        const unitPrice = selectedProduct.price;
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
        data: {heading: "Errors - Corder Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.corder = this.form.getRawValue();
      //console.log("Photo-Before"+this.order.photo);
      //this.order.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.order.photo);
      let proddata: string = "";
      proddata = proddata + "<br>Number is : "+ this.corder.number;
      // proddata = proddata + "<br>Name is : "+ this.order.name;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Order Add", message: "Are you sure to Add the following Order? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("OrderService.add(emp)");
          this.os.add(this.corder).then((response: []|undefined) => {
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
              data: {heading: "Status -Corder Add", message: addmessage}
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


  fillForm(corder:Corder) {

    this.enableButtons(false, true, true);
    this.selectedrow=corder;

    this.corder = JSON.parse(JSON.stringify(corder));
    this.oldcorder = JSON.parse(JSON.stringify(corder));

    /*if (this.order.image != null) {
    this.imageempurl = btoa(this.order.image);
      this.form.controls['image'].clearValidators();
    }else {
     this.clearImage();
    }*/

    //this.order.image = "";
    //@ts-ignore
    this.corder.customer = this.customers.find(g => g.id === this.corder.customer.id);
    //@ts-ignore
    this.corder.orderstatus = this.orderstatuses.find(a => a.id === this.corder.orderstatus.id);
    //@ts-ignore
    this.corder.product = this.products.find(p => p.id === this.corder.product.id);


    this.form.patchValue(this.corder);
    this.form.markAsPristine();
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Corder Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Corder Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.corder = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.corder.image = btoa(this.imageempurl);
            //else this.corder.image = this.oldcorder.image;
            //@ts-ignore
            this.corder.id = this.oldcorder.id;
            this.os.update(this.corder).then((response: [] | undefined) => {
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
                data: {heading: "Status -Corder Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Corder Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Corder Delete",
        message: "Are you sure to Delete folowing Corder? <br> <br>" +
          this.corder.number
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.os.delete(this.corder.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Corder Delete ", message: delmessage}
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
