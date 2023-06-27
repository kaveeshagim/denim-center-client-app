import {Component} from '@angular/core';
import {Router} from "@angular/router";


@Component({
  selector: 'app-mainwindow',
  templateUrl: './mainwindow.component.html',
  styleUrls: ['./mainwindow.component.css']
})
export class MainwindowComponent {

  opened: boolean = true;


  constructor(private router: Router) {
  }

  logout(): void {
    this.router.navigateByUrl("login");
  }

}

