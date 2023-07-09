import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {TokenStorageService} from "../services/token-storage.service";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material/tabs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  selectedRole!: string;
  roles: string[] = [];
  dataSource: any[] = []; // Provide the current user object as the data source
  displayedColumns: string[] = ['username', 'token', 'roles', 'getUserRole(user: any)']; // Specify the displayed columns
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  loggedInRole: any;

  constructor(private token: TokenStorageService, private router: Router) { }

  ngOnInit(): void {
    this.currentUser = this.token.getUser();
    this.dataSource = [this.currentUser]; // Assign the current user object as the data source
    this.roles = this.token.getUser().roles;

  }

  getUserRole(user: any): string {
    const loggedInRole = this.roles.find(role => user.roles.includes(role));
    const currentUrl = this.router.url;
    if (currentUrl === '/manager/profile') {
      return "ROLE_MANAGER";
    } else if (currentUrl === '/executive/profile') {
      return "ROLE_EXECUTIVE";
    } else if (currentUrl === '/admin/profile'){
      return "ROLE_ADMIN";
    }
    return loggedInRole || ''; // Return the logged-in role, or an empty string if not found
  }


  onTabChange(event: MatTabChangeEvent){}



  changeRoles(selectedRole: string): void {
    // Use the 'selectedRole' parameter as needed
    // Perform the necessary logic to determine the destination based on the selected role
    let destination: string;
    switch (selectedRole) {
      case "ROLE_MANAGER":
        destination = '/manager/profile'; // Replace with the actual route for Role 1
        break;
      case "ROLE_EXECUTIVE":
        destination = '/executive/profile'; // Replace with the actual route for Role 2
        break;
      case "ROLE_ADMIN":
        destination = '/admin/profile'; // Replace with the actual route for Role 3
        break;
      default:
        destination = '/default'; // Replace with the default route
        break;
    }

    // Navigate to the determined destination
    this.router.navigateByUrl(destination);
  }


}
