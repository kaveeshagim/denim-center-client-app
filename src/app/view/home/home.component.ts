import {Component} from '@angular/core';
import {Countbyproductionstatus} from "../../report/entity/countbyproductionstatus";
import {MatTableDataSource} from "@angular/material/table";
import {ReportService} from "../../report/view/reportservice";
import {Supplier} from "../../entity/supplier";
import {Countbycorderstatus} from "../../report/entity/countbycorderstatus";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  cols = "6"

  countbyproductionstatuses!: Countbyproductionstatus[];
  countbycorderstatuses!: Countbycorderstatus[];
  inProgressProductionCount = 0;
  inProgressCustomerCount = 0;

  constructor (
    private rs: ReportService
  ){


  }

  ngOnInit() {
    this.fetchProductionStatuses();
    this.fetchCorderStatuses();
  }

  async fetchProductionStatuses() {
    try {
      console.log('Fetching production statuses...');
      this.countbyproductionstatuses = await this.rs.countbyproductionstatus();
      console.log('Production statuses retrieved:', this.countbyproductionstatuses);
      this.updateInProgressProductionOrders();
    } catch (error) {
      console.error('Failed to fetch production statuses:', error);
    }
  }

  async fetchCorderStatuses() {
    try {
      console.log('Fetching customer order statuses...');
      this.countbycorderstatuses = await this.rs.countbycorderstatus();
      console.log('Customer order statuses retrieved:', this.countbycorderstatuses);
      this.updateInProgressCustomerOrders();
    } catch (error) {
      console.error('Failed to fetch customer order statuses:', error);
    }
  }

  updateInProgressProductionOrders() {
    // Reset the count before recalculating
    this.inProgressProductionCount = 0;

    for (const status of this.countbyproductionstatuses) {
      if (status.productionstatus === 'In Progress') {
        this.inProgressProductionCount = status.count;
        break; // Stop the loop once 'in progress' status is found
      }
    }

    console.log('Count of "in progress" production orders:', this.inProgressProductionCount);
  }

  updateInProgressCustomerOrders() {
    // Reset the count before recalculating
    this.inProgressCustomerCount = 0;

    for (const status of this.countbycorderstatuses) {
      if (status.corderstatus === 'Pending') {
        this.inProgressCustomerCount = status.count;
        break; // Stop the loop once 'in progress' status is found
      }
    }

    console.log('Count of "Pending" customer orders:', this.inProgressCustomerCount);
  }

}
