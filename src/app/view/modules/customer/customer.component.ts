import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Customer} from "../../../entity/customer";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {UiAssist} from "../../../util/ui/ui.assist";
import {CustomerService} from "../../../service/customerservice";
import {RegexService} from "../../../service/regexservice";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {DatePipe} from "@angular/common";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent {

  columns: string[] = ['id', 'companyname', 'name', 'address', 'nic', 'mobile', 'email', 'city', 'dateadded'];
  headers: string[] = ['Id', 'Companyname', 'Name', 'Address', 'Nic', 'Mobile', 'Email', 'City', 'Dateadded'];
  binders: string[] = ['id', 'companyname', 'name', 'address', 'nic', 'mobile', 'email', 'city', 'dateadded'];


  public ssearch!: FormGroup;
  public form!: FormGroup;

  customer!: Customer;

  oldcustomer!: Customer|undefined;

  selectedrow: any;
  customers: Array<Customer> = [];
  data!: MatTableDataSource<Customer>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;


  regexes: any;
  uiassist:UiAssist;
  constructor(
    private cs: CustomerService,
    private rs: RegexService,
    private ts: TokenStorageService,
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
      "nic": new FormControl('', [Validators.required]),
      "mobile": new FormControl('', [Validators.required]),
      "email": new FormControl('', [Validators.required]),
      "city": new FormControl('', [Validators.required]),
      "dateadded": new FormControl('', [Validators.required]),
    }, {updateOn: 'change'});

  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.createForm();

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
    this.form.controls['nic'].setValidators([Validators.required]);
    this.form.controls['mobile'].setValidators([Validators.required]);
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
        if (this.oldcustomer != undefined && control.valid) {
          // @ts-ignore
          if (value === this.customer[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    //this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.oldcustomer = undefined;
    this.form.reset();
    //this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    if (this.ts.getUser().roles.includes("ROLE_ADMIN")){
      this.enableButtons(true, false, false);
    }else{
      this.enableButtons(false, false, false);
    }
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.cs.getAll(query)
      .then((prods: Customer[]) => {
        this.customers = prods;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.customers);
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
        data: {heading: "Errors - Customer Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.customer = this.form.getRawValue();
      let custdata: string = "";
      custdata = custdata + "<br>Company name is : "+ this.customer.companyname;
      custdata = custdata + "<br>Customer name is : "+ this.customer.name;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Customer Add", message: "Are you sure to Add the following Customer? <br> <br>"+ custdata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("CustomerService.add(emp)");
          this.cs.add(this.customer).then((response: []|undefined) => {
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
              data: {heading: "Status -Customer Add", message: addmessage}
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
  fillForm(customer:Customer) {

    if (this.ts.getUser().roles.includes("ROLE_ADMIN")){
      this.enableButtons(false, true, true);
    }else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow=customer;

    this.customer = JSON.parse(JSON.stringify(customer));
    this.oldcustomer = JSON.parse(JSON.stringify(customer));

    /* if (this.customer.image != null) {
      this.imageempurl = btoa(this.customer.image);
      this.form.controls['image'].clearValidators();
    }else {
      this.clearImage();
    } */

    /* this.customer.image = "";
    //@ts-ignore
    this.customer.gender = this.genders.find(g => g.id === this.customer.gender.id);
    //@ts-ignore
    this.customer.department = this.departments.find(d => d.id === this.customer.department.id);
    //@ts-ignore
    this.customer.empstatus = this.empstatuses.find(s => s.id === this.customer.empstatus.id); */

    this.form.patchValue(this.customer);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Customer Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Customer Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.customer = this.form.getRawValue();
           // if (this.form.controls['image'].dirty) this.customer.image = btoa(this.imageempurl);
           // else this.customer.image = this.oldcustomer.image;
            //@ts-ignore
            this.customer.id = this.oldcustomer.id;
            this.cs.update(this.customer).then((response: [] | undefined) => {
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
                data: {heading: "Status -Customer Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Customer Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Customer Delete",
        message: "Are you sure to Delete folowing Customer? <br> <br>" +
          this.customer.name
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.cs.delete(this.customer.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Customer Delete ", message: delmessage}
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
