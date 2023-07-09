import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient, HttpHeaders} from "@angular/common/http";


@Component({
  selector: 'app-mainwindow',
  templateUrl: './mainwindow.component.html',
  styleUrls: ['./mainwindow.component.css']
})
export class MainwindowComponent implements OnInit{

  opened: boolean = true;
  data: any;

  constructor(private router: Router, private http: HttpClient) {
  }

  ngOnInit() {

  }

  logout(): void {
    this.router.navigateByUrl("login");
  }

}

