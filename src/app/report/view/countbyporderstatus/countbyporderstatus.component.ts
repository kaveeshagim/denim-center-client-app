import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {ReportService} from "../reportservice";
import {Countbyporderstatus} from "../../entity/countbyporderstatus";

declare var google: any;

@Component({
  selector: 'app-countbyporderstatus',
  templateUrl: './countbyporderstatus.component.html',
  styleUrls: ['./countbyporderstatus.component.css']
})
export class CountbyporderstatusComponent implements OnInit{

  countbyporderstatuses!: Countbyporderstatus[];
  data!: MatTableDataSource<Countbyporderstatus>;

  columns: string[] = ['porderstatus', 'count', 'percentage'];
  headers: string[] = ['Porderstatus', 'Count', 'Percentage'];
  binders: string[] = ['porderstatus', 'count', 'percentage'];

  @ViewChild('barchart', { static: false }) barchart: any;
  @ViewChild('piechart', { static: false }) piechart: any;
  @ViewChild('linechart', { static: false }) linechart: any;

  constructor(private rs: ReportService) {
    //Define Interactive Panel with Needed Form Elements
  }

  ngOnInit(): void {

    this.rs.countbyporderstatus()
      .then((des: Countbyporderstatus[]) => {
        this.countbyporderstatuses = des;
      }).finally(() => {
      this.loadTable();
      this.loadCharts();
    });

  }

  print() {
    window.print();
  }
  loadTable() : void{
    this.data = new MatTableDataSource(this.countbyporderstatuses);
  }

  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
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

    this.countbyporderstatuses.forEach((des: Countbyporderstatus) => {
      barData.addRow([des.porderstatus, des.count]);
      pieData.addRow([des.porderstatus, des.count]);
      lineData.addRow([des.porderstatus, des.count]);
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
