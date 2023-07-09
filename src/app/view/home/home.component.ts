import {Component, OnInit} from '@angular/core';
import {Countbyproductionstatus} from "../../report/entity/countbyproductionstatus";
import {MatTableDataSource} from "@angular/material/table";
import {ReportService} from "../../report/view/reportservice";
import {Supplier} from "../../entity/supplier";
import {Countbycorderstatus} from "../../report/entity/countbycorderstatus";
import {Expense} from "../../report/entity/expense";
import {Income} from "../../report/entity/income";
import {UserService} from "../../service/userservice";
import {Router, RouterModule} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  content?: string;


  countbyproductionstatuses!: Countbyproductionstatus[];
  countbycorderstatuses!: Countbycorderstatus[];

  expenses!: Expense[];
  incomes!: Income[];
  inProgressProductionCount = 0;
  inProgressCustomerCount = 0;

  todayexpense = 0;
  todayincome = 0;

  constructor(private userService: UserService, private rs: ReportService) {
  }

  ngOnInit(): void {
    this.userService.getPublicContent().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {
        this.content = JSON.parse(err.error).message;
      }
    });

    this.fetchProductionStatuses();
    this.fetchCorderStatuses();
    this.expensesToday();
    this.incomeToday();
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


  expensesToday() {
    this.rs.expense().then((expenses) => {
      console.log('Expenses retrieved:', expenses);

      const currentDate = new Date();
      this.todayexpense = 0;

      for (const expense of expenses) {
        const expenseDate = new Date(expense.date);
        if (
          expenseDate.getDate() === currentDate.getDate() &&
          expenseDate.getMonth() === currentDate.getMonth() &&
          expenseDate.getFullYear() === currentDate.getFullYear()
        ) {
          this.todayexpense += expense.amount;
        }
      }

      console.log('Total expenses for today:', this.todayexpense);
    }).catch((error) => {
      console.error('Failed to fetch expenses:', error);
    });
  }

  incomeToday() {
    console.log('Fetching income for today...');
    this.rs.income().then((incomes) => {
      console.log('Income retrieved:', incomes);

      const currentDate = new Date();
      this.todayincome = 0;

      for (const date in incomes) {
        if (incomes.hasOwnProperty(date)) {
          const incomeDate = new Date(date);
          if (
            incomeDate.getDate() === currentDate.getDate() &&
            incomeDate.getMonth() === currentDate.getMonth() &&
            incomeDate.getFullYear() === currentDate.getFullYear()
          ) {
            this.todayincome += incomes[date].amount;
          }
        }
      }

      console.log('Total income for today:', this.todayincome);
    }).catch((error) => {
      console.error('Failed to fetch income:', error);
    });
  }


}


