import {Component, OnInit} from '@angular/core';
import {UserService} from "../../service/userservice";
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {TokenStorageService} from "../services/token-storage.service";

@Component({
  selector: 'app-board-admin',
  templateUrl: './board-admin.component.html',
  styleUrls: ['./board-admin.component.css']
})
export class BoardAdminComponent implements OnInit {
  content?: string;
  opened: boolean = true;
  data: any;

  constructor(private userService: UserService, private router: Router, private http: HttpClient, private tokenStorage: TokenStorageService) { }

  ngOnInit(): void {
    this.userService.getAdminBoard().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {
        this.content = JSON.parse(err.error).message;
      }
    });
  }

  /*navigateToProfile(): void {
    this.router.navigateByUrl("profile");
  }*/
  logout(): void {
    this.tokenStorage.signOut();
    this.router.navigateByUrl("login");
  }
}
