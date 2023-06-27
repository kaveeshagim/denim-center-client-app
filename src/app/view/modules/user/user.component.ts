import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../../entity/user";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Userstatus} from "../../../entity/userstatus";
import {UiAssist} from "../../../util/ui/ui.assist";
import {UserService} from "../../../service/userservice";
import {UserstatusService} from "../../../service/userstatusservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  columns: string[] = ['username', 'password', 'docreated', 'userstatus'];
  headers: string[] = ['Username', 'Password', 'Datecreated', 'Userstatus'];
  binders: string[] = ['username', 'password', 'docreated', 'userstatus.name'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  user!: User;
  olduser!: User|undefined;

  selectedrow: any;
  users: Array<User> = [];
  data!: MatTableDataSource<User>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string = 'assets/default.png';

  userstatuses: Array<Userstatus> = [];

  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private us: UserService,
    private uss: UserstatusService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);


    this.ssearch = this.fb.group({
      "ssusername": new FormControl(),
      "ssuserstatus": new FormControl(),


    });

    this.form = this.fb.group({
      "username": new FormControl('', [Validators.required]),
      "password": new FormControl('', [Validators.required]),
      "docreated": new FormControl('', [Validators.required]),
      "userstatus": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.uss.getAllList().then((ists: Userstatus[]) => {
      this.userstatuses = ists;
      console.log("C-" + this.userstatuses);
    });

    this.rs.get('user').then((regs: []) => {
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
    this.form.controls['username'].setValidators([Validators.required]);
    this.form.controls['password'].setValidators([Validators.required]);
    this.form.controls['docreated'].setValidators([Validators.required]);
    this.form.controls['userstatus'].setValidators([Validators.required]);


    //Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="docreated")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.olduser != undefined && control.valid) {
          // @ts-ignore
          if (value === this.user[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    //this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.olduser = undefined;
    this.form.reset();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    this.enableButtons(true, false, false);
    this.selectedrow = null;
  }

  loadTable(query:string){
    this.us.getAll(query)
      .then((prods: User[]) => {
        this.users = prods;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.users);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let username = ssearchdata.ssusername;
    let userstatusid = ssearchdata.ssuserstatus;


    let query="";

    if(username!=null) query=query+"&username="+username;
    if(userstatusid!=null) query=query+"&userstatusid="+userstatusid;


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
  }

  getModi(element: User) {
    return element.number + '(' + element.name + ')';
  } */

  /*filterTable(): void {

    const csearchdata = this.csearch.getRawValue();

    this.data.filterPredicate = (user: User, filter: string) => {

      return (csearchdata.csusername == null || user.username.toLowerCase().includes(csearchdata.csusername)) &&
        (csearchdata.csuserstatus == null || user.userstatus.name.toLowerCase().includes(csearchdata.csuserstatus))

    }

    this.data.filter = 'xx';
  }*/

  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - User Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.user = this.form.getRawValue();
      //console.log("Photo-Before"+this.user.photo);
      //this.user.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.user.photo);
      let proddata: string = "";
      proddata = proddata + "<br>Number is : "+ this.user.username;
      //proddata = proddata + "<br>Name is : "+ this.user.name;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - User Add", message: "Are you sure to Add the following User? <br> <br>"+ proddata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("UserService.add(emp)");
          this.us.add(this.user).then((response: []|undefined) => {
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
              data: {heading: "Status -User Add", message: addmessage}
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


  fillForm(user:User) {

    this.enableButtons(false, true, true);
    this.selectedrow=user;

    this.user = JSON.parse(JSON.stringify(user));
    this.olduser = JSON.parse(JSON.stringify(user));

    /*if (this.user.image != null) {
      this.imageempurl = btoa(this.user.image);
      this.form.controls['image'].clearValidators();
    }else {
      this.clearImage();
    }*/

    //this.user.image = "";
    //@ts-ignore
    this.user.userstatus = this.userstatuses.find(t => t.id === this.user.userstatus.id);


    this.form.patchValue(this.user);
    this.form.markAsPristine();
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - User Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - User Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.user = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.user.image = btoa(this.imageempurl);
            //else this.user.image = this.olduser.image;
            //@ts-ignore
            this.user.id = this.olduser.id;
            this.us.update(this.user).then((response: [] | undefined) => {
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
                data: {heading: "Status -User Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - User Update", message: "Nothing Changed"}
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
        heading: "Confirmation - User Delete",
        message: "Are you sure to Delete folowing User? <br> <br>" +
          this.user.username
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.us.delete(this.user.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - User Delete ", message: delmessage}
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

