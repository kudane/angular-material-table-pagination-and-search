import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { combineLatest, Subscription } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { MockDataService } from './mock-data.service';
import { PeriodicItem } from './mock.model';

class TableControl {
  private _subscriptions$: Subscription;
  // for get data
  private _dataService: MockDataService;

  // for search
  private _textControl = new FormControl('');

  // for table
  public readonly columns = ['position', 'name', 'weight', 'symbol'];
  private _paginator: MatPaginator;
  private _totalCount: number = 0;
  private _dataSource: PeriodicItem[] = [];
  public get data() {
    return this._dataSource;
  }
  public get totalCount() {
    return this._totalCount;
  }

  constructor(dataService: MockDataService, paginator: MatPaginator) {
    this._dataService = dataService;
    this._paginator = paginator;
  }

  public watchSearch() {
    if (!this._paginator) {
      throw new Error('paginator is null, please set in ngAfterViewInit');
    }

    // Array ของ Observable เมื่อ search หรือ page เปลี่ยนแปลง
    // เพิ่ม startWith สำหรับ initial data หรือ ทำให้เกิดการ call service ครั้งแรก เพราะ
    // combineLatest จะปล่อยค่าออกมา เมื่อ Observable ใน Array มีการปล่อยค่าออกมาทุกตัว
    this._subscriptions$ = combineLatest([
      this._paginator.page.pipe(
        startWith({ length: 0, pageIndex: 0, pageSize: 2 } as PageEvent)
      ),
      this._textControl.valueChanges.pipe(startWith(''))
    ])
      .pipe(
        // log ดูข้อมูล
        tap(([page, search]) => console.log(page, search)),
        // unsubscribe ที่ combineLatest แล้ว
        // เปลี่ยนไป get data จาก service
        switchMap(() => {
          return this._dataService.getItemsWithPagination(
            this._textControl.value,
            this._paginator.pageSize,
            this._paginator.pageIndex
          );
        }),
        // อัพเดท total count และ ปล่อยค่าเฉพาะ items
        map(({ items, totalCount }) => {
          this._totalCount = totalCount;
          return items;
        })
      )
      .subscribe((items: PeriodicItem[]) => (this._dataSource = items));
  }

  public search(text: string) {
    // reset to first page
    this._paginator.pageIndex = 0;
    this._textControl.setValue(text);
  }

  public destroy() {
    this._subscriptions$.unsubscribe();
    this._dataSource = null;
    this._paginator = null;
    this._textControl = null;
  }
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  tableControl: TableControl;

  constructor(private dataService: MockDataService) {}

  ngAfterViewInit(): void {
    this.tableControl = new TableControl(this.dataService, this.paginator);
    this.tableControl.watchSearch();
  }

  ngOnDestroy(): void {
    this.tableControl.destroy();
  }
}
