import {Component, ViewChild} from '@angular/core';
import {ProductService} from "../../../service/productservice";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UiAssist} from "../../../util/ui/ui.assist";
import {Gender} from "../../../entity/gender";
import {Agecategory} from "../../../entity/agecategory";
import {Color} from "../../../entity/color";
import {Size} from "../../../entity/size";
import {Type} from "../../../entity/type";
import {GenderService} from "../../../service/genderservice";
import {AgecategoryService} from "../../../service/agecategoryservice";
import {ColorService} from "../../../service/colorservice";
import {SizeService} from "../../../service/sizeservice";
import {TypeService} from "../../../service/typeservice";

import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {RegexService} from "../../../service/regexservice";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {Product} from "../../../entity/product";
import {Customer} from "../../../entity/customer";
import {DatePipe} from "@angular/common";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {

  // Define columns for the table
  columns: string[] = ['code', 'name', 'price', 'proddate', 'description', 'image', 'gender', 'agecategory', 'color', 'size', 'type'];
  headers: string[] = ['Code', 'Name', 'Price', 'Proddate', 'Description', 'Image', 'Gender', 'Agecategory', 'Color', 'Size', 'Type'];
  binders: string[] = ['code', 'name', 'price', 'proddate', 'description', 'image', 'gender.name', 'agecategory.name', 'color.name', 'size.name', 'type.name'];

  // Define form groups and form controls
  public ssearch!: FormGroup;
  public form!: FormGroup;

  product!: Product;
  oldproduct!: Product|undefined;

  selectedrow: any;
  products: Array<Product> = [];
  data!: MatTableDataSource<Product>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  imageempurl: string = 'assets/default.png';

  // Arrays for dropdowns
  genders: Array<Gender> = [];
  agecategories: Array<Agecategory> = [];
  colors: Array<Color> = [];
  sizes: Array<Size> = [];
  types: Array<Type> = [];

  // Button flags
  enaadd:boolean = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private ps: ProductService,
    private gs: GenderService,
    private as: AgecategoryService,
    private cs: ColorService,
    private ss: SizeService,
    private ts: TypeService,
    private tss: TokenStorageService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);

    // Initialize the search form group
    this.ssearch = this.fb.group({
      "sscode": new FormControl(),
      "ssgender": new FormControl(),
      "ssagecategory": new FormControl(),
      "sscolor": new FormControl(),
      "sssize": new FormControl(),
      "sstype": new FormControl(),

    });

    // Initialize the product form group
    this.form = this.fb.group({
      "code": new FormControl('', [Validators.required, Validators.pattern("^\\d{4}$")]),
      "name": new FormControl('', [Validators.required]),
      "price": new FormControl('', [Validators.required]),
      "proddate": new FormControl('', [Validators.required]),
      "description": new FormControl('', ),
      "image": new FormControl('', [Validators.required]),
      "gender": new FormControl('', [Validators.required]),
      "agecategory": new FormControl('', [Validators.required]),
      "color": new FormControl('', [Validators.required]),
      "size": new FormControl('', [Validators.required]),
      "type": new FormControl('', [Validators.required]),
    }, {updateOn: 'change'});

  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    // Fetch gender list
    this.gs.getAllList().then((gens: Gender[]) => {
      this.genders = gens;
      console.log("G-" + this.genders);
    });
    // Fetch age category list
    this.as.getAllList().then((ags: Agecategory[]) => {
      this.agecategories = ags;
      console.log("A-" + this.agecategories);
    });
    // Fetch color list
    this.cs.getAllList().then((cls: Color[]) => {
      this.colors = cls;
      console.log("C-" + this.colors);
    });
    // Fetch size list
    this.ss.getAllList().then((szs: Size[]) => {
      this.sizes = szs;
      console.log("S-" + this.sizes);
    });
    // Fetch type list
    this.ts.getAllList().then((tps: Type[]) => {
      this.types = tps;
      console.log("T-" + this.types);
    });

    // Fetch regexes for form validation
    this.rs.get('product').then((regs: []) => {
    this.regexes = regs;
    console.log("R-" + this.regexes['code']['regex']);
    this.createForm();
    });

this.createSearch();
}

createView() {
this.loadTable("");
}

createSearch(){ }

createForm(){
  // Set validators for form controls
    this.form.controls['code'].setValidators([Validators.required,Validators.pattern(this.regexes['code']['regex'])]);
    this.form.controls['name'].setValidators([Validators.required]);
    this.form.controls['price'].setValidators([Validators.required]);
    this.form.controls['proddate'].setValidators([Validators.required]);
    //this.form.controls['description'].setValidators([Validators.required,Validators.pattern(this.regexes['description']['regex'])]);
    this.form.controls['image'].setValidators([Validators.required]);
    this.form.controls['gender'].setValidators([Validators.required]);
    this.form.controls['agecategory'].setValidators([Validators.required]);
    this.form.controls['color'].setValidators([Validators.required]);
    this.form.controls['size'].setValidators([Validators.required]);
    this.form.controls['type'].setValidators([Validators.required]);


  // Subscribe to value changes of form controls
  for (const controlName in this.form.controls) {
    const control = this.form.controls[controlName];
    control.valueChanges.subscribe(value => {
      // @ts-ignore
      // Convert proddate to desired format
      if(controlName=="proddate")
        value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
      // Check if the value has changed
      if (this.oldproduct != undefined && control.valid) {
        // @ts-ignore
        if (value === this.product[controlName]){ control.markAsPristine(); }
        else { control.markAsDirty(); }
      }
      else{ control.markAsPristine(); }
    });
  }

  this.loadForm();
}

loadForm(){
  // Reset the form and mark all controls as touched
  this.oldproduct = undefined;
  this.form.reset();
  this.clearImage();
  Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
  if (this.tss.getUser().roles.includes("ROLE_ADMIN") || this.tss.getUser().roles.includes("ROLE_MANAGER")) {
    this.enableButtons(true, false, false);
  } else {
    this.enableButtons(false, false, false);
  }
  this.selectedrow = null;
}

loadTable(query:string){
  // Load table data based on the query
this.ps.getAll(query)
  .then((prods: Product[]) => {
    this.products = prods;
  })
  .catch((error) => {
    console.log(error);
  })
  .finally(() => {
    this.data = new MatTableDataSource(this.products);
    this.data.paginator = this.paginator;
  });
}

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let code = ssearchdata.sscode;
    let genderid = ssearchdata.ssgender;
    let agecategoryid = ssearchdata.ssage;
    let colorid = ssearchdata.sscolor;
    let sizeid = ssearchdata.sssize;
    let typeid = ssearchdata.sstype;

    let query="";

    //building a query string based on the value of the variable
    if(code!=null && code.trim()!="") query=query+"&code="+code;
    if(genderid!=null) query=query+"&genderid="+genderid;
    if(agecategoryid!=null) query=query+"&agecategoryid="+agecategoryid;
    if(colorid!=null) query=query+"&colorid="+colorid;
    if(sizeid!=null) query=query+"&sizeid="+sizeid;
    if(typeid!=null) query=query+"&typeid="+typeid;

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

  selectImage(e:any):void{
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




  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Product Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.product = this.form.getRawValue();
      //console.log("Photo-Before"+this.product.photo);
      this.product.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.product.photo);
      let proddata: string = "";
      proddata = proddata + "<br>Code is : "+ this.product.code;
      proddata = proddata + "<br>Name is : "+ this.product.name;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Product Add", message: "Are you sure to Add the following Product? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("ProductService.add(emp)");
          this.ps.add(this.product).then((response: []|undefined) => {
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
              this.clearImage();
              this.loadTable("");
            }
            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Product Add", message: addmessage}
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

  fillForm(product:Product) {

    if (this.tss.getUser().roles.includes("ROLE_ADMIN") || this.tss.getUser().roles.includes("ROLE_MANAGER")) {
      this.enableButtons(false, true, true);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow=product;

    this.product = JSON.parse(JSON.stringify(product));
    this.oldproduct = JSON.parse(JSON.stringify(product));

    if (this.product.image != null) {
      this.imageempurl = btoa(this.product.image);
      this.form.controls['image'].clearValidators();
    }else {
      this.clearImage();
    }

    this.product.image = "";
    //@ts-ignore
    this.product.gender = this.genders.find(g => g.id === this.product.gender.id);
    //@ts-ignore
    this.product.agecategory = this.agecategories.find(a => a.id === this.product.agecategory.id);
    //@ts-ignore
    this.product.type = this.types.find(t => t.id === this.product.type.id);
    //@ts-ignore
    this.product.color = this.colors.find(c => c.id === this.product.color.id);
    //@ts-ignore
    this.product.size = this.sizes.find(s => s.id === this.product.size.id);

    this.form.patchValue(this.product);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Product Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Product Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.product = this.form.getRawValue();
            if (this.form.controls['image'].dirty) this.product.image = btoa(this.imageempurl);
            else {//@ts-ignore
              this.product.image = this.oldproduct.image;
            }
            //@ts-ignore
            this.product.id = this.oldproduct.id;
            this.ps.update(this.product).then((response: [] | undefined) => {
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
                data: {heading: "Status -Product Update", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Product Update", message: "Nothing Changed"}
        });
        updmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
      }
    }
  }


 // iterates over the form controls, checks if each control has been changed, and generates a string
  // representation of the updates. The string includes the names of the controls that have been changed,
  // with the first letter capitalized and the word "Changed" appended
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
        heading: "Confirmation - Product Delete",
        message: "Are you sure to Delete folowing Product? <br> <br>" +
          this.product.code
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.ps.delete(this.product.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Product Delete ", message: delmessage}
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
