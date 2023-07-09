import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Materialmovement} from "../../../entity/materialmovement";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {Materialinventory} from "../../../entity/materialinventory";
import {Movementtype} from "../../../entity/movementtype";
import {UiAssist} from "../../../util/ui/ui.assist";
import {MaterialmovementService} from "../../../service/materialmovementservice";
import {MaterialinventoryService} from "../../../service/materialinventoryservice";
import {MovementtypeService} from "../../../service/movementtypeservice";
import {RegexService} from "../../../service/regexservice";
import {DatePipe} from "@angular/common";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MessageComponent} from "../../../util/dialog/message/message.component";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {TokenStorageService} from "../../services/token-storage.service";

@Component({
  selector: 'app-materialmovement',
  templateUrl: './materialmovement.component.html',
  styleUrls: ['./materialmovement.component.css']
})
export class MaterialmovementComponent {

  columns: string[] = ['qty', 'date', 'remarks', 'materialinventory', 'movementtype'];
  headers: string[] = ['Qty', 'Date', 'Remarks', 'Materialinventory', 'Movementtype'];
  binders: string[] = ['qty', 'date', 'remarks', 'materialinventory.number', 'movementtype.name'];

  public ssearch!: FormGroup;
  public form!: FormGroup;

  materialmovement!: Materialmovement;
  oldmaterialmovement!: Materialmovement|undefined;

  selectedrow: any;
  materialmovements: Array<Materialmovement> = [];
  data!: MatTableDataSource<Materialmovement>;
  imageurl: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  imageempurl: string = 'assets/default.png';

  materialinventories: Array<Materialinventory> = []
  movementtypes: Array<Movementtype> = [];


  enaadd:boolean  = false;
  enaupd:boolean = false;
  enadel:boolean = false;

  regexes: any;
  uiassist:UiAssist;
  constructor(
    private mms: MaterialmovementService,
    private mis: MaterialinventoryService,
    private mts: MovementtypeService,
    private rs: RegexService,
    private ts: TokenStorageService,
    private fb: FormBuilder,
    private dp: DatePipe,
    private dg: MatDialog ) {

    this.uiassist = new UiAssist(this);



    this.ssearch = this.fb.group({
      "ssmaterialinventory": new FormControl(),
      "ssmovementtype": new FormControl(),


    });

    this.form = this.fb.group({
      "qty": new FormControl('', [Validators.required]),
      "date": new FormControl('', [Validators.required]),
      "remarks": new FormControl('', ),
      "materialinventory": new FormControl('', [Validators.required]),
      "movementtype": new FormControl('', [Validators.required]),

    }, {updateOn: 'change'});
  }

  ngOnInit(){
    this.initialize();
  }

  initialize() {
    this.createView();

    this.mis.getAllList().then((gens: Materialinventory[]) => {
      this.materialinventories = gens;
      console.log("G-" + this.materialinventories);
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
    this.form.controls['materialinventory'].setValidators([Validators.required]);
    this.form.controls['movementtype'].setValidators([Validators.required]);


    //Object.values(this.form.controls).forEach(control => { control.markAsTouched();});

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      control.valueChanges.subscribe(value => {
        // @ts-ignore
        if(controlName=="date")
          value = this.dp.transform(new Date(value), 'yyyy-MM-dd');
        if (this.oldmaterialmovement != undefined && control.valid) {
          // @ts-ignore
          if (value === this.materialmovement[controlName]){ control.markAsPristine(); }
          else { control.markAsDirty(); }
        }
        else{ control.markAsPristine(); }
      });
    }

    //this.enableButtons(true, false, false);
    this.loadForm();
  }

  loadForm(){
    this.oldmaterialmovement = undefined;
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
    this.mms.getAll(query)
      .then((prods: Materialmovement[]) => {
        this.materialmovements = prods;
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        this.data = new MatTableDataSource(this.materialmovements);
        this.data.paginator = this.paginator;
      });
  }

  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let materialinventoryid = ssearchdata.ssmaterialinventory;
    let movementtypeid = ssearchdata.ssmovementtype;

    let query="";

    if(movementtypeid!=null) query=query+"&movementtypeid="+movementtypeid;
    if(materialinventoryid!=null) query=query+"&materialinventoryid="+materialinventoryid;


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




  add() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Materialmovement Add ", message: "You have following Errors <br> " + errors}
      });
      errmsg.afterClosed().subscribe(async result => {
        if (!result) { return; }
      });
    } else {
      this.materialmovement = this.form.getRawValue();
      let proddata: string = "";
      proddata = proddata + "<br>Material Inventory number is : " + this.materialmovement.materialinventory.number;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {heading: "Confirmation - Materialmovement Add", message: "Are you sure to Add the following Materialmovement? <br> <br>" + proddata}
      });
      let addstatus: boolean = false;
      let addmessage: string = "Server Not Found";
      confirm.afterClosed().subscribe(async result => {
        if (result) {
          this.mms.add(this.materialmovement).then((response: [] | undefined) => {

            // Update the material inventory based on the movement type
            const selectedMovementType = this.materialmovement.movementtype;
            const quantity = this.materialmovement.qty;
            const materialInventoryNumber = this.materialmovement.materialinventory.number;

            // Retrieve the material inventory object from the server
            this.mis.getAll(materialInventoryNumber).then((inventory: any) => {
              // @ts-ignore
              if (selectedMovementType === 'In') {
                // Increase the material quantity in the inventory
                inventory.qty += quantity;
              } else { // @ts-ignore
                if (selectedMovementType === 'Out') {
                                // Decrease the material quantity in the inventory
                                inventory.qty -= quantity;
                              }
              }

              // Update the material inventory on the server
              this.mis.update(inventory).then((inventoryResponse: any) => {
                // Update the local component with the updated material inventory object
                this.materialmovement.materialinventory = inventory;
              });
            });

            console.log("Res-" + response);
            console.log("Un-" + response == undefined);

            if (response != undefined) {
              // @ts-ignore
              addstatus = response['errors'] == "";
              console.log("Add Sta-" + addstatus);
              if (!addstatus) {
                // @ts-ignore
                addmessage = response['errors'];
              }
            } else {
              console.log("undefined");
              addstatus = false;
              addmessage = "Content Not Found";
            }
          }).finally(() => {
            if (addstatus) {
              addmessage = "Successfully Saved";
              this.form.reset();
              this.loadTable("");
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {heading: "Status -Materialmovement Add", message: addmessage}
            });
            stsmsg.afterClosed().subscribe(async result => {
              if (!result) { return; }
            });
          });
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
    const tabIndex = event.index;
    // Perform actions based on the selected tab index
    if (tabIndex === 0) {
      // Do something when the first tab is selected
    } else if (tabIndex === 1) {
      // Do something when the second tab is selected
    } else if (tabIndex === 2) {
      // Do something when the third tab is selected
    }
    // Add more conditions for other tabs if needed
  }

  fillForm(materialmovement:Materialmovement) {

    if (this.ts.getUser().roles.includes("ROLE_ADMIN") || this.ts.getUser().roles.includes("ROLE_MANAGER")) {
      this.enableButtons(false, true, true);
    } else {
      this.enableButtons(false, false, false);
    }
    this.selectedrow=materialmovement;

    this.materialmovement = JSON.parse(JSON.stringify(materialmovement));
    this.oldmaterialmovement = JSON.parse(JSON.stringify(materialmovement));

    //@ts-ignore
    this.materialmovement.materialinventory = this.productinventories.find(g => g.id === this.materialmovement.materialinventory.id);
    //@ts-ignore
    this.materialmovement.movementtype = this.movementtypes.find(t => t.id === this.materialmovement.movementtype.id);


    this.form.patchValue(this.materialmovement);
    this.form.markAsPristine();
    this.tabGroup.selectedIndex = 0;
  }

  update() {
    let errors = this.getErrors();
    if (errors != "") {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {heading: "Errors - Materialmovement Update ", message: "You have following Errors <br> " + errors}
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
            heading: "Confirmation - Materialmovement Update",
            message: "Are you sure to Save following Updates? <br> <br>" + updates
          }
        });
        confirm.afterClosed().subscribe(async result => {
          if (result) {
            this.materialmovement = this.form.getRawValue();
            //if (this.form.controls['image'].dirty) this.materialmovement.image = btoa(this.imageempurl);
            //else this.materialmovement.image = this.oldmaterialmovement.image;
            //@ts-ignore
            this.materialmovement.id = this.oldmaterialmovement.id;
            this.mms.update(this.materialmovement).then((response: [] | undefined) => {
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
                data: {heading: "Status -Materialmovement Add", message: updmessage}
              });
              stsmsg.afterClosed().subscribe(async result => { if (!result) { return; } });
            });
          }
        });
      }
      else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {heading: "Confirmation - Materialmovement Update", message: "Nothing Changed"}
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
        heading: "Confirmation - Materialmovement Delete",
        message: "Are you sure to Delete folowing Materialmovement? <br> <br>" +
          this.materialmovement.id
      }
    });
    confirm.afterClosed().subscribe(async result => {
      if (result) {
        let delstatus: boolean = false;
        let delmessage: string = "Server Not Found";
        this.mms.delete(this.materialmovement.id).then((response: [] | undefined) => {
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
            data: {heading: "Status - Materialmovement Delete ", message: delmessage}
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
