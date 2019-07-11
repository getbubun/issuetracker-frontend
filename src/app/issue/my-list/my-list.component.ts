import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from 'src/app/models/DataTablesResponse';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { IssuePostedByUser } from 'src/app/models/IssuePostedByUser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-list',
  templateUrl: './my-list.component.html',
  styleUrls: ['./my-list.component.css']
})
export class MyListComponent implements OnInit, OnDestroy {

  dtOptions: DataTables.Settings = {};
  //persons: Person[];
  issues: IssuePostedByUser[];
  currentUser: any;
  currentUserSubscription :Subscription 
  constructor(private toastr: ToastrService, private http: HttpClient, private authService: AuthenticationService) { }

  ngOnInit() {
    this.currentUserSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
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
            `${environment.baseUrl}api/v1/issues/get/createdby/${this.currentUser.userDetails._id}?authToken=${this.currentUser.authToken}`,
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
      columns: [{ data: 'title', width: '40%' }, { data: 'createdOn', width: '30%' }, 
      { data: 'status', width: '10%' },
      { data: 'assignedTo', width: '20%', orderable: false },
      { data: 'issueId', orderable: false }, { data: '', orderable: false }]
    };
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }
}
