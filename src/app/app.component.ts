import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { combineLatest } from 'rxjs';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { MockDataService } from './mock-data.service';
import { PeriodicItem } from './mock.model';

class TableControl {
  // for get data
  private _dataService: MockDataService;

  // for search
  private _textControl = new FormControl('');

  // for table
  public readonly columns: string[] = ['position', 'name', 'weight', 'symbol'];
  private _paginator: MatPaginator;
  private _totalCount: number = 0;
  private _dataSource: PeriodicItem[] = [];
  get data() {
    return this._dataSource;
  }
  get totalCount() {
    return this._totalCount;
  }

  constructor(dataService: MockDataService, paginator: MatPaginator) {
    this._dataService = dataService;
    this._paginator = paginator;
  }

  public watchSearch() {
    // add listen stram of interactive with table
    combineLatest([
      // init value for init starm
      this._paginator.page.pipe(
        startWith({ length: 0, pageIndex: 0, pageSize: 2 } as PageEvent)
      ),
      this._textControl.valueChanges.pipe(startWith(''))
    ])
      .pipe(
        // log data
        tap(([page, search]) => console.log(page, search)),
        // stop before stram, then start stram in [switchMap]
        switchMap(() => {
          return this._dataService.getItemsWithPagination(
            this._textControl.value,
            this._paginator.pageSize,
            this._paginator.pageIndex
          );
        }),
        // get data for update count of table row
        map(({ items, totalCount }) => {
          this._totalCount = totalCount;
          return items;
        })
      )
      .subscribe(items => {
        // store table row & displayed
        this._dataSource = items;
      });
  }

  search(text: string) {
    // reset to first page
    this._paginator.pageIndex = 0;
    this._textControl.setValue(text);
  }
}

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  tableControl: TableControl;

  constructor(private dataService: MockDataService) {}

  ngAfterViewInit(): void {
    this.tableControl = new TableControl(this.dataService, this.paginator);
    this.tableControl.watchSearch();
  }
}
