import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { IssueByReporter } from '../models/issueByReporter';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from '../models/DataTablesResponse';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthenticationService } from '../services/authentication.service';
import { environment } from 'src/environments/environment';
import { getElementDepthCount } from '@angular/core/src/render3/state';
import { IssueService } from '../services/issue.service';
import { DashboardCount } from '../models/dashboardCount';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  issues: IssueByReporter[];
  currentUser: any;
  dashboardCount: DashboardCount;
  constructor(private toastr: ToastrService,
    private http: HttpClient, private authService: AuthenticationService, private issueService:IssueService,
    private spinner: NgxSpinnerService) { }

  someClickHandler(info: any): void {
  }
  ngOnInit() {

    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.getCount();
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      //pageLength: 2,
      lengthMenu: [10, 25, 50, 100],
      serverSide: true,
      processing: true,
      autoWidth: false,
      language: {
        processing: '<i class="fa fa-spinner fa-spin fa-fw text-primary"></i><span class="sr-only">Loading...</span>'
      },
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(
            `${environment.baseUrl}api/v1/issues/get/reportedBy/${this.currentUser.userDetails._id}?authToken=${this.currentUser.authToken}`,
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
      columns: [{ data: 'title', width: '40%' }, { data: 'createdOn', width: '30%' }, { data: 'status', width: '10%' },
      { data: 'createdBy', width: '20%', orderable: false },
      { data: 'issueId', width: '10%', orderable: false }, { data: '', orderable: false }]

    };
  }
  getCount = () => {
    let data={
      id: this.currentUser.userDetails._id,
      authToken: this.currentUser.authToken
    }
    this.issueService.getCount(data).subscribe((resp)=>{
      this.dashboardCount= resp.data;
    },(err)=>{
      this.toastr.error(err);
    })
  };//end of getCount 
}
