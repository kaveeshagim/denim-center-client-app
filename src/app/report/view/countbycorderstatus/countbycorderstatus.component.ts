import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ReportService} from "../reportservice";
import {Countbycorderstatus} from "../../entity/countbycorderstatus";
import {TokenStorageService} from "../../../view/services/token-storage.service";

declare var google: any;

@Component({
  selector: 'app-countbycorderstatus',
  templateUrl: './countbycorderstatus.component.html',
  styleUrls: ['./countbycorderstatus.component.css']
})
export class CountbycorderstatusComponent implements OnInit{

  countbycorderstatuses!: Countbycorderstatus[];
  data!: MatTableDataSource<Countbycorderstatus>;

  columns: string[] = ['corderstatus', 'count', 'percentage'];
  headers: string[] = ['Customerorderstatus', 'Count', 'Percentage'];
  binders: string[] = ['corderstatus', 'count', 'percentage'];

  @ViewChild('barchart', { static: false }) barchart: any;
  @ViewChild('piechart', { static: false }) piechart: any;
  @ViewChild('linechart', { static: false }) linechart: any;

  constructor(private rs: ReportService, private ts: TokenStorageService) {
    //Define Interactive Panel with Needed Form Elements
  }

  ngOnInit(): void {
    if (this.ts.getUser().roles.includes("ROLE_ADMIN")) {
      this.rs.countbycorderstatus()
        .then((des: Countbycorderstatus[]) => {
          this.countbycorderstatuses = des;
        }).finally(() => {
        this.loadTable();
        this.loadCharts();
      });
    }
  }

  loadTable() : void{
    this.data = new MatTableDataSource(this.countbycorderstatuses);
  }

  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }

  print() {
    window.print();
  }

  drawCharts() {

    const barData = new google.visualization.DataTable();
    barData.addColumn('string', 'Designation');
    barData.addColumn('number', 'Count');

    const pieData = new google.visualization.DataTable();
    pieData.addColumn('string', 'Designation');
    pieData.addColumn('number', 'Count');

    const lineData = new google.visualization.DataTable();
    lineData.addColumn('string', 'Designation');
    lineData.addColumn('number', 'Count');

    this.countbycorderstatuses.forEach((des: Countbycorderstatus) => {
      barData.addRow([des.corderstatus, des.count]);
      pieData.addRow([des.corderstatus, des.count]);
      lineData.addRow([des.corderstatus, des.count]);
    });

    const barOptions = {
      title: 'Designation Count (Bar Chart)',
      subtitle: 'Count of Employees by Designation',
      bars: 'horizontal',
      height: 400,
      width: 600
    };

    const pieOptions = {
      title: 'Designation Count (Pie Chart)',
      height: 400,
      width: 550
    };

    const lineOptions = {
      title: 'Designation Count (Line Chart)',
      height: 400,
      width: 600
    };

    const barChart = new google.visualization.BarChart(this.barchart.nativeElement);
    barChart.draw(barData, barOptions);

    const pieChart = new google.visualization.PieChart(this.piechart.nativeElement);
    pieChart.draw(pieData, pieOptions);

    const lineChart = new google.visualization.LineChart(this.linechart.nativeElement);
    lineChart.draw(lineData, lineOptions);
  }

}
