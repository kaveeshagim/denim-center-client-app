import {Component, OnInit, ViewChild} from '@angular/core';
import {Productinventory} from "../../../entity/productinventory";
import {MatTableDataSource} from "@angular/material/table";
import {Countbyproductionstatus} from "../../entity/countbyproductionstatus";
import {ProductinventoryService} from "../../../service/productinventoryservice";
import {Materialinventory} from "../../../entity/materialinventory";
import {UiAssist} from "../../../util/ui/ui.assist";
import {TokenStorageService} from "../../../view/services/token-storage.service";

declare var google: any;
@Component({
  selector: 'app-productinventoryreport',
  templateUrl: './productinventoryreport.component.html',
  styleUrls: ['./productinventoryreport.component.css']
})
export class ProductinventoryreportComponent implements OnInit{

  productinventories!: Productinventory[];
  data!: MatTableDataSource<Productinventory>;

  uiassist:UiAssist;

  columns: string[] = ['Code', 'product', 'reorderlevel', 'qty', 'inventorystatus'];
  headers: string[] = ['Code', 'Product', 'Reorderlevel', 'Quantity', 'Inventory Status'];
  binders: string[] = ['product.code', 'product.name', 'reorderlevel', 'qty', 'inventorystatus'];

  @ViewChild('barchart', { static: false }) barchart: any;
  @ViewChild('piechart', { static: false }) piechart: any;
  @ViewChild('linechart', { static: false }) linechart: any;

  constructor(
    private pis: ProductinventoryService, private ts: TokenStorageService
  ) {

    this.uiassist = new UiAssist(this);
  }
  ngOnInit(): void {
    if (this.ts.getUser().roles.includes("ROLE_ADMIN")) {
      this.pis.getAllList()
        .then((des: Productinventory[]) => {
          this.productinventories = des;
          this.productinventories = this.calculateInventoryStatus();
        }).finally(() => {
        this.loadTable();
        this.loadCharts();
      });
    }
  }

  calculateInventoryStatus(): Productinventory[] {
    return this.productinventories.map((productinventory: Productinventory) => {
      const inventorystatus = productinventory.qty < productinventory.reorderlevel ? 'Low Inventory' : 'Available';
      return { ...productinventory, inventorystatus };
    });
  }

  print() {
    window.print();
  }

  loadTable() : void{
    this.data = new MatTableDataSource(this.productinventories);
  }

  loadCharts() : void{
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.drawCharts.bind(this));
  }

  drawCharts() {

    const barData = new google.visualization.DataTable();
    barData.addColumn('string', 'Product');
    barData.addColumn('number', 'Quantity');
    barData.addColumn('number', 'ReorderLevel');


    this.productinventories.forEach((des: Productinventory) => {
      barData.addRow([des.product.code, des.qty, des.reorderlevel]);


    });

    const barOptions = {
      title: 'Product Inventory (Bar Chart)',
      subtitle: 'Product Inventory',
      bars: 'horizontal',
      height: 400,
      width: 600
    };



    const barChart = new google.visualization.BarChart(this.barchart.nativeElement);
    barChart.draw(barData, barOptions);


  }

}
