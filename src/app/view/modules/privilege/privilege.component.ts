import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {User} from "../../../entity/user";
import {TokenStorageService} from "../../services/token-storage.service";
import {UserService} from "../../../service/userservice";
import {MatTableDataSource} from "@angular/material/table";
import {Employee} from "../../../entity/employee";
import {Role} from "../../../entity/role";
import {Userrole} from "../../../entity/userrole";
import {from} from "rxjs";
import {RoleService} from "../../../service/roleservice";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {UiAssist} from "../../../util/ui/ui.assist";
import {Product} from "../../../entity/product";
import {Privilege} from "../../../entity/privilege";
import {Module} from "../../../entity/module";
import {ModuleService} from "../../../service/moduleervice";
import {PrivilegeService} from "../../../service/privilegeservice";
import {Gender} from "../../../entity/gender";
import {MatPaginator} from "@angular/material/paginator";
import {ConfirmComponent} from "../../../util/dialog/confirm/confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {Agecategory} from "../../../entity/agecategory";
import {Color} from "../../../entity/color";
import {Size} from "../../../entity/size";
import {Type} from "../../../entity/type";

@Component({
  selector: 'app-privilege',
  templateUrl: './privilege.component.html',
  styleUrls: ['./privilege.component.css']
})
export class PrivilegeComponent implements OnInit{

  columns: string[] = ['name', 'module', 'role'];
  headers: string[] = ['Name', 'Module', 'Role'];
  binders: string[] = ['name', 'module.name', 'role.name'];
  public ssearch!: FormGroup;
  privilege!: Privilege;
  privileges : Array<Privilege> = [];
  uiassist:UiAssist;
  data!: MatTableDataSource<Privilege>;
  dataSource!: MatTableDataSource<User>;
  modules: Array<Module> = [];
  users: Array<User> = [];
  roles: Array<Role> = [];
  userroles: Array<Userrole> = [];
  displayedColumns: string[] = ['username', 'roles', 'edit'];
  user!: User;
  selectedRoles: string[] = [];
  checkedRoles: { [key: string]: boolean } = {};
  selectedUser: any; // Property to store the selected user
  userRoles: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  constructor(private us: UserService,
              private rls: RoleService,
              private ts: TokenStorageService,
              private fb: FormBuilder,
              private ms: ModuleService,
              private ps: PrivilegeService,
              private dg: MatDialog ) {
    this.uiassist = new UiAssist(this);

    this.ssearch = this.fb.group({
      "ssmodule": new FormControl(),
      "ssrole": new FormControl(),

    });
  }


  ngOnInit(): void {
    if (this.ts.getUser().roles.includes("ROLE_ADMIN")) {
      from(this.us.getAllList()).subscribe((users: User[]) => {
        this.users = users;
        this.dataSource = new MatTableDataSource<User>(this.users);
        console.log(this.users);
      });
      this.initialize();
    }
  }

  initialize() {
    this.createView();

    this.ms.getAllList().then((mods: Module[]) => {
      this.modules = mods;
      console.log("G-" + this.modules);
    });
    this.rls.getAllList().then((rols: Role[]) => {
      this.roles = rols;
      console.log("R-" + this.roles);
    });
    this.createSearch();
  }

  createView() {
    this.loadTable("");
  }

  createSearch(){ }

  loadTable(query: string) {
    this.ps.getAll(query)
      .then((prods: Privilege[]) => {
        this.privileges = prods;
        console.log(this.privileges);

        this.data = new MatTableDataSource(this.privileges);
        this.data.paginator = this.paginator;
        this.data.connect(); // Connect the data source to the table
      })
      .catch((error) => {
        console.log(error);
      });
  }


  btnSearchMc(): void {
    const ssearchdata = this.ssearch.getRawValue();

    let roleid = ssearchdata.ssrole;
    let moduleid = ssearchdata.ssmodule;

    let query="";

    if(roleid!=null) query=query+"&roleid="+roleid;
    if(moduleid!=null) query=query+"&moduleid="+moduleid;

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



  onTabChange(event: MatTabChangeEvent){}

  async submitRoles() {
    if (this.selectedUser) {
      const userId = this.selectedUser.id;
      const currentRoles = Object.keys(this.checkedRoles).filter(role => this.checkedRoles[role]);
      const newRoles = currentRoles.filter(role => !this.userRoles.includes(role));
      const removedRoles = this.userRoles.filter(role => !currentRoles.includes(role));

      try {
        if (newRoles.length > 0) {
          await this.us.addRolesToUser(userId, newRoles);
          console.log('User roles added successfully');
        }

        if (removedRoles.length > 0) {
          await this.us.removeRolesFromUser(userId, removedRoles);
          console.log('User roles deleted successfully');
        }

        // Reload the user roles
        await this.loadUserRoles(userId);
      } catch (error) {
        console.error('Failed to update user roles:', error);
        // Handle the error
      }
    } else {
      // No user selected
      // Display an error message or handle as needed
    }
    this.loadTable('');
  }




  loadUserRoles(user: any) {
    this.selectedUser = user;
    this.checkedRoles = {}; // Clear the checkedRoles object before populating it
    user.roles.forEach((role: any) => {
      this.checkedRoles[role.name] = true; // Set the role as a key with a value of true
    });
    // Load the roles and any other relevant information for the selected user
    // You can call an API or fetch the necessary data from a service
  }
}
