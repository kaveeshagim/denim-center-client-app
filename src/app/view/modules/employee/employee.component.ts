import {Component, ViewChild} from '@angular/core';
import {Employee} from "../../../entity/employee";
import {Gender} from "../../../entity/gender";
import {EmployeeService} from "../../../service/employeeservice";
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Department} from "../../../entity/department";
import {Empstatus} from "../../../entity/empstatus";
import {MatDialog} from "@angular/material/dialog";
import {RegexService} from "../../../service/regexservice";
import {GenderService} from "../../../service/genderservice";
import {DepartmentService} from "../../../service/departmentservice";
import {EmpstatusService} from "../../../service/empstatusservice";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent {

  columns: string[] = ['id', 'firstname', 'lastname', 'gender', 'mobile', 'land', 'email', 'dob', 'doj', 'address', 'nic', 'image', 'department', 'empstatus'];
  headers: string[] = ['Id', 'Firstname', 'Lastname', 'Gender', 'Mobile', 'Land', 'Email', 'Dob', 'Doj', 'Address', 'Nic', 'Image', 'Department', 'Empstatus'];
  binders: string[] = ['id', 'firstname', 'lastname', 'gender.name', 'mobile', 'land', 'email', 'dob', 'doj', 'address', 'nic', 'image', 'department.name', 'empstatus.name'];


  public ssearch !: FormGroup;
  public form !: FormGroup;

  employee!: Employee;
  oldemployee!: Employee|undefined;
  selectedrow: any;
  employees: Array<Employee> = [];
  imageurl: string = '';
  data !: MatTableDataSource<Employee>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  imageempurl: string = 'assets/default.png';

  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  genders: Array<Gender> = [];
  departments: Array<Department> = [];
  empstatuses: Array<Empstatus> = [];

  regexes: any;

  uiassist: UiAssist;

  constructor(
    private es: EmployeeService,
    private gs: GenderService,
    private ds: DepartmentService,
    private ss: EmpstatusService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog) {

    this.uiassist = new UiAssist(this);


    this.ssearch = this.fb.group({
      "ssfirstname": new FormControl(),
      "sslastname": new FormControl(),
      "ssgender": new FormControl(),
      "ssdepartment": new FormControl(),
    });

    this.form = this.fb.group({
      "firstname": new FormControl('', [Validators.required, Validators.pattern("^([A-Z][a-z]+)$")]),
      "lastname": new FormControl('', [Validators.required, Validators.pattern("^([A-Z][a-z]+)$")]),
      "gender": new FormControl('', [Validators.required]),
      "mobile": new FormControl('', [Validators.required, Validators.pattern("^0\\d{9}$")]),
      "land": new FormControl('', [Validators.required, Validators.pattern("^0\\d{9}$")]),
      "email": new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$")]),
      "dob": new FormControl('', [Validators.required, this.validateDob]),
      "doj": new FormControl('', [Validators.required]),
      "address": new FormControl('', [Validators.required]),
      "nic": new FormControl('', [Validators.required, Validators.pattern("^(([\\d]{9}[vVxX])|([\\d]{12}))$")]),
      "image": new FormControl('', [Validators.required]),
      "department": new FormControl('', [Validators.required]),
      "empstatus": new FormControl('', [Validators.required]),
    }, {updateOn: 'change'});
  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.createView();

    this.gs.getAllList().then((gens: Gender[]) => {
      this.genders = gens;
      console.log("G-" + this.genders);
    });
    this.ds.getAllList().then((deps: Department[]) => {
      this.departments = deps;
      console.log("D-" + this.departments);
    });
    this.ss.getAllList().then((stes: Empstatus[]) => {
      this.empstatuses = stes;
      console.log("S-" + this.empstatuses);
    });

    this.rs.get('employee').then((regs: []) => {
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

  createSearch() {
  }

  createForm(){
    this.form.controls['firstname'].setValidators([Validators.required,Validators.pattern(this.regexes['firstname']['regex'])]);
    this.form.controls['lastname'].setValidators([Validators.required,Validators.pattern(this.regexes['lastname']['regex'])]);
    this.form.controls['gender'].setValidators([Validators.required]);
    this.form.controls['mobile'].setValidators([Validators.required,Validators.pattern(this.regexes['mobile']['regex'])]);
    this.form.controls['land'].setValidators([Validators.required,Validators.pattern(this.regexes['land']['regex'])]);
    this.form.controls['email'].setValidators([Validators.required,Validators.pattern(this.regexes['email']['regex'])]);
    this.form.controls['dob'].setValidators([
      Validators.required,
      this.validateDob.bind(this) // Bind the validation function to the component context
    ]);
    this.form.controls['doj'].setValidators([Validators.required]);
    this.form.controls['address'].setValidators([Validators.required]);
    this.form.controls['nic'].setValidators([Validators.required,Validators.pattern(this.regexes['nic']['regex'])]);
    this.form.controls['image'].setValidators([Validators.required]);
    this.form.controls['department'].setValidators([Validators.required]);
    this.form.controls['empstatus'].setValidators([Validators.required]);



    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="dob" || controlName=="doj")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');

        if (this.oldemployee != undefined && control.valid) {
          // @ts-ignore
          if (value === this.employee[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }


    this.loadForm();

  }

  validateDob(control: FormControl): { [key: string]: boolean } | null {
    const currentDate = new Date();
    const selectedDate = new Date(control.value);

    // Set the time portion of currentDate to 00:00:00 to compare only dates
    currentDate.setHours(0, 0, 0, 0);

    if (selectedDate >= currentDate) {
      return { invalidDOB: true };
    }

    return null;
  }





  loadForm() {
    this.oldemployee = undefined;
    this.form.reset();
    this.clearImage();
    Object.values(this.form.controls).forEach(control => { control.markAsTouched();});
    this.enableButtons(true, false, false);
    this.selectedrow = null;
  }

  loadTable(query: string) {
    this.es.getAll(query)
      .then((emps: Employee[]) => {
        this.employees = emps;
        this.imageurl = 'assets/fullfilled.png';
      })
      .catch((error) => {
        console.log(error);
        this.imageurl = 'assets/rejected.png';
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.employees);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let firstname = ssearchdata.ssfirstname;
    let lastname = ssearchdata.sslastname;
    let genderid = ssearchdata.ssgender;
    let departmentid = ssearchdata.ssdepartment;


    let query = "";

    if (firstname != null && firstname.trim() != "") query = query + "&firstname=" + firstname;
    if (lastname != null && lastname.trim() != "") query = query + "&lastname=" + lastname;
    if (genderid != null) query = query + "&genderid=" + genderid;
    if (departmentid != null) query = query + "&departmentid=" + departmentid;

    if (query != "") query = query.replace(/^./, "?")
    this.loadTable(query);
  }

  btnSearchClearMc(): void {

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {heading: "Search Clear", messagecategory: "Are you sure you want to Clear the Search?"}
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        this.ssearch.reset();
        this.loadTable("");
      }

    });
  }

  selectImage(e: any): void {
    if (e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.imageempurl = event.target.result;
        this.form.controls['image'].clearValidators();
      }
    }
  }

  clearImage(): void {
    this.imageempurl = 'assets/default.png';
    this.form.controls['image'].setErrors({'required': true});
  }


  add(){
    let errors = this.getErrors();
    if(errors!=""){
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Employee Add ", message: "You have following Errors <br> "+errors}
      });
      errmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
    }
    else{
      this.employee = this.form.getRawValue();
      //console.log("Photo-Before"+this.employee.photo);
      this.employee.image=btoa(this.imageempurl);
      //console.log("Photo-After"+this.employee.photo);
      let empdata: string = "";
      //empdata = empdata + "<br>Id is : "+ this.employee.id;
      empdata = empdata + "<br>First Name is : "+ this.employee.firstname;
      empdata = empdata + "<br>Last Name is : "+ this.employee.lastname;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Employee Add",
          message: "Are you sure to Add the following Employee? <br> <br>"+ empdata}
      });
      let addstatus:boolean=false;
      let addmessage:string="Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if(result){
          // console.log("EmployeeService.add(emp)");
          this.es.add(this.employee).then((response: []|undefined) => {
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
              data: {heading: "Status -Employee Add", message: addmessage}
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

  fillForm(employee:Employee) {

    this.enableButtons(false, true, true);
    this.selectedrow=employee;

    this.employee = JSON.parse(JSON.stringify(employee));
    this.oldemployee = JSON.parse(JSON.stringify(employee));

    if (this.employee.image != null) {
      this.imageempurl = btoa(this.employee.image);
      this.form.controls['image'].clearValidators();
    }else {
      this.clearImage();
    }

    this.employee.image = "";
    //@ts-ignore
    this.employee.gender = this.genders.find(g => g.id === this.employee.gender.id);
    //@ts-ignore
    this.employee.department = this.departments.find(d => d.id === this.employee.department.id);
    //@ts-ignore
    this.employee.empstatus = this.empstatuses.find(s => s.id === this.employee.empstatus.id);

    this.form.patchValue(this.employee);
    this.form.markAsPristine();
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Employee Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Employee Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.employee = this.form.getRawValue();
            if (this.form.controls['image'].dirty) this.employee.image = btoa(this.imageempurl);
            else {//@ts-ignore
              this.employee.image = this.oldemployee.image;
            }
            //@ts-ignore
            this.employee.id = this.oldemployee.id;
            this.es.update(this.employee).then((response: [] | undefined) => {
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
                data: {heading: "Status -Employee Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Employee Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Employee Delete",
        message: "Are you sure to Delete folowing Employee? <br> <br>" +
          this.employee.firstname
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.es.delete(this.employee.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Employee Delete ", message: delmessage}
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
        message: "Are you sure you want to Clear the Form? <br><br> You will lose all your updates"
      }
    });

    confirm.afterClosed().subscribe(async result => {
      if (result) {
        this.loadForm();
      }
    });
  }

}
