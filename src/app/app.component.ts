import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort} from '@angular/material/sort';
import { combineLatest, Subscription, of } from 'rxjs';
import { catchError, delay, map, startWith, switchMap, tap } from 'rxjs/operators';
import { PeriodicService } from './periodic.service';
import { PeriodicItem } from './periodic.model';

class TableControl {
  private _subscriptions$: Subscription;
  private _periodicService: PeriodicService;
  public readonly columns = ['no', 'name', 'weight', 'symbol'];
  private  _textControl = new FormControl('');
  private _paginator: MatPaginator;
  private _sort: MatSort;
  private _totalCount: number = 0;
  private _dataSource: PeriodicItem[] = [];
  private _isLoadingResults = false;
  private _isError = false;


  public set periodicService(periodicService: PeriodicService) {
    this._periodicService = periodicService;
  }

  public set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
  }

  public set sort(sort: MatSort) {
    this._sort = sort;
  }

  public get dataSource() {
    return this._dataSource;
  }

  public get totalCount() {
    return this._totalCount;
  }

  public get isLoadingResults() {
    return this._isLoadingResults;
  }

  public get isError() {
    return this._isError;
  }

  public makeAllReady() {
    if (!this._paginator) {
      throw new Error('paginator is null, please set in ngAfterViewInit');
    }

    if (!this._sort) {
      throw new Error('sort is null, please set in ngAfterViewInit');
    }

    if (!this._periodicService) {
      throw new Error(
        'periodic service is null, please set in constructor'
      );
    }
  }

  public watch(): void {
    // เช็ค DI มีค่าทั้งหมด ป้องกัน DI null
    this.makeAllReady();

    // Array ของ Observable เมื่อ search หรือ page เปลี่ยนแปลง
    // เพิ่ม startWith สำหรับ initial data หรือ ทำให้เกิดการ call service ครั้งแรก เพราะ
    // combineLatest จะปล่อยค่าออกมา เมื่อ Observable ใน Array มีการปล่อยค่าออกมาทุกตัว
    // delay(0) คือ fix error NG0100: ExpressionChangedAfterItHasBeenCheckedError
    this._subscriptions$ = combineLatest([
      this._sort.sortChange.pipe(
        startWith({}),
        delay(0)
      ),
      this._paginator.page.pipe(
        startWith({}),
        delay(0)
      ),
      this._textControl.valueChanges.pipe(startWith(''))
    ]).pipe(
        // unsubscribe ที่ combineLatest แล้ว
        // เปลี่ยนไป get data จาก service
        // catchError ใน switchMap ป้องกัน combineLatest พังทั้งเส้น
        switchMap(() => {
          this._isError = false;;
          this._isLoadingResults = true;

          return this._periodicService.getItemsWithPagination(
            this._textControl.value,
            this._paginator.pageSize,
            this._paginator.pageIndex,
            this._sort.active,
            this._sort.direction
          ).pipe(
            catchError(() => {
              this._isError = true;
              return of({items: [], totalCount: this._totalCount });
            })
          );
        }),
        // อัพเดท total count และ ปล่อยค่าเฉพาะ items
        map(({ items, totalCount }) => {
          this._isLoadingResults = false;
          this._totalCount = totalCount;
          return items;
        })
      )
      .subscribe((items: PeriodicItem[]) => (this._dataSource = items));
  }

  public search(text: string): void {
    // reset to first page
    this._paginator.pageIndex = 0;
    this._textControl.setValue(text);
  }

  public destroy(): void {
    this._subscriptions$?.unsubscribe();
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
  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator) {
    this.tableControl.paginator = paginator;
  }
  
  @ViewChild(MatSort)
  set sort(sort: MatSort) {
    this.tableControl.sort = sort;
  }

  tableControl = new TableControl();

  constructor(periodicService: PeriodicService) {
    this.tableControl.periodicService = periodicService;
  }

  ngAfterViewInit(): void {
    // เมื่อ [กดค้นหา] หรือ [เปลี่ยนหน้า] จะ get data อัตโนมัติ
    this.tableControl.watch();
  }

  ngOnDestroy(): void {
    // ลบ resource ที่ใช้ทิ้ง
    this.tableControl.destroy();
  }
}