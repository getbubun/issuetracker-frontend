import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { AllIssue } from 'src/app/models/AllIssue';
import { Subscription } from 'rxjs';
import { DataTablesResponse } from 'src/app/models/DataTablesResponse';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {

  constructor(private toastr: ToastrService, private http: HttpClient, private authService: AuthenticationService) { }

  dtOptions: DataTables.Settings = {};
  //persons: Person[];
  issues: AllIssue[];
  currentUserSubscription: Subscription;
  currentUser: any;
  ngOnInit() {
    this.currentUserSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });

    this.fillDataTable();
  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }
  fillDataTable = () => {

    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      lengthMenu: [10, 25, 50, 100],
      serverSide: true,
      processing: true,
      language: {
        processing: '<i class="fa fa-spinner fa-spin fa-fw text-primary"></i><span class="sr-only">Loading...</span>'
      },
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(
            `${environment.baseUrl}api/v1/issues/get/all?authToken=${this.currentUser.authToken}`,
            dataTablesParameters, {}
          ).subscribe(resp => {
            that.issues = resp.data;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: []
            });
          });
      },
      columns: [{ data: 'title', width: '30%' }, { data: 'createdOn', width: '30%' }, 
      { data: 'status', width: '10%' },
      { data: 'createdBy', width: '15%', orderable: false },
      { data: 'assignedTo', width: '15%', orderable: false },
      { data: 'issueId', orderable: false }, { data: '', orderable: false }]
    };
  };//end of fillDataTable function


}
