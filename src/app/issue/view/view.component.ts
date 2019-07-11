import { Component, OnInit, ElementRef, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/services/user.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { CreateIssue } from 'src/app/models/create-issue';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { IssueService } from 'src/app/services/issue.service';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FileUploader } from 'ng2-file-upload';
import { NgForm } from '@angular/forms';
import { SocketService } from 'src/app/services/socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  // @ViewChild('scrollMe', { read: ElementRef })
  // public scrollMe: ElementRef;
  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  //baseUrl = 'http://localhost:3000/api/v1/';
  @ViewChild('updateForm') updateForm: NgForm;
  navigationSubscription;
  issue: CreateIssue;
  currentUser: any;
  allUsers: any = [];
  modalRef: BsModalRef;
  confirmModal: BsModalRef;
  modalAttachment: BsModalRef;
  photo: any;
  attachment: any = [];
  status: any = ['In-Progress', 'In-Backlog', 'In-Test', 'Done'];
  currentIssueId: string; //to hold current issue id from route
  currentAssignee: string; //to hold current assignee
  authToken: string;
  comments = [];
  watchers = [];
  commentDescription: string = '';
  isAWatcher: boolean = false;
  public scrollToCommentTop: boolean = false;
  public pageValue: number = 0;
  public loadingPreviousChat: boolean = false;
  photoUrl = '';

  constructor(private route: ActivatedRoute, private router: Router, private socket: SocketService, private modalService: BsModalService, private cd: ChangeDetectorRef,
    private issueService: IssueService, private spinner: NgxSpinnerService, private el: ElementRef,
    private userService: UserService, private authService: AuthenticationService, private toastr: ToastrService) {

  }

  ngOnInit() {
    this.photoUrl = environment.baseUrl;
    this.issue = {
      title: '',
      description: '',
      attachment: '',
      assignee: ''
    };
    this.currentIssueId = this.route.snapshot.paramMap.get("issueId");

    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.authToken = this.currentUser.authToken;
    });
    this.initialiseInvites();

  }

  initialiseInvites() {
    this.initializeUploader();
    this.getIssue(this.currentIssueId);
    this.getComment();
    this.getAllUsers();
    this.getWatchers();
  }
  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we  
    // don't then we will continue to run our initialiseInvites()   
    // method on every navigationEnd event.
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }
  openModal(photo: string, template: TemplateRef<any>) {
    this.photo = `${environment.baseUrl}${photo}`;
    this.modalRef = this.modalService.show(template);
  }

  openAttachmentModal(template: TemplateRef<any>) {
    this.modalAttachment = this.modalService.show(template, { class: 'modal-lg' });
  }

  openConfirmModal(photo: string, template: TemplateRef<any>) {
    this.photo = photo;
    this.confirmModal = this.modalService.show(template, { class: 'modal-sm' });
  }
  confirm(): void {
    this.deletePhoto(this.photo);
    this.confirmModal.hide();
  }

  decline(): void {
    this.confirmModal.hide();
  }
  // ngAfterContentInit() {
  //   this.cd.detectChanges();
  // }
  //file upload code

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }
  initializeUploader() {

    this.uploader = new FileUploader({

      url: environment.baseUrl + 'api/v1/issues/create/' + this.currentIssueId + '/upload?authToken=' + this.authToken,
      itemAlias: 'photo',
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; }

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const res = JSON.parse(response);

        this.attachment = res.data.attachment;

        // this.lgModal = this.modalService.hide(10);
      }
    };
    this.uploader.onCompleteAll = () => {
      this.toastr.success('File Uploaded Successfully')
      this.modalAttachment.hide();
    };
  }
  //add as watcher
  addWatcher() {
    this.issueService.addWatcher(this.currentIssueId, this.currentUser.userDetails._id, this.authToken).subscribe(
      (resp) => {
        if (resp.status === 200) {
          this.toastr.success(resp.message);
          let watcherObj = {
            watcherId: this.currentUser.userDetails,
            createdOn: resp.data.createdOn
          }
          this.watchers.push(watcherObj);
          this.isAWatcher = true;

          if (this.currentUser.userDetails._id != this.currentAssignee) {
            let x = {
              roomName: this.currentIssueId,
              watcherId : this.currentUser.userDetails._id
            };
            this.socket.updateRoom(x);
          }
        }
        else
          this.toastr.error(resp.message);
      }, (err) => {
        this.toastr.error(err);
      }
    );
  }
  //get watcher

  getWatchers() {
    this.openSpinner(true);
    this.issueService.getWatchers(this.currentIssueId, this.pageValue * 10, this.authToken).subscribe(
      (apiResponse) => {
        let previousData = (this.watchers.length > 0 ? this.watchers.slice() : []);
        if (apiResponse.status == 200) {
          this.watchers = apiResponse.data.concat(previousData);
        }
        else {
          this.watchers = previousData;
          this.toastr.warning(apiResponse.message);
        }
        this.openSpinner(false);
        var test = this.watchers.find(x => x.watcherId._id === this.currentUser.userDetails._id)
        if (test)
          this.isAWatcher = true;
      }, (error) => {
        this.openSpinner(false);
        this.toastr.error('Error while fetching watchers- ' + error);
      }
    );
  };//end of getWatchers
  //get comment
  getComment = () => {

    this.openSpinner(true);
    this.issueService.getComment(this.currentIssueId, this.pageValue * 10, this.authToken).subscribe(
      (apiResponse) => {

        let previousData = (this.comments.length > 0 ? this.comments.slice() : []);
        if (apiResponse.status == 200) {
          this.comments = apiResponse.data.concat(previousData);
        }
        else {
          this.comments = previousData;
          this.toastr.warning(apiResponse.message);
        }
        this.loadingPreviousChat = false;
        this.openSpinner(false);
      }, (error) => {
        this.openSpinner(false);
        this.toastr.error('Error while fetching comments ' + error);
      }
    );
  };

  //Ctrl+Enter key to send comment
  postUsingKeyPress(event) {
    if (event.ctrlKey && event.keyCode === 13) {
      this.postComment();
    }
  }
  //post comment to post comment to db
  postComment() {
    let objpost = {
      issueId: this.currentIssueId,
      description: this.commentDescription,
      createdBy: this.currentUser.userDetails._id,
      authToken: this.authToken
    };

    this.issueService.postComment(objpost).subscribe(
      (resp) => {
        if (resp.error === false) {
          let comment = {
            description: this.commentDescription,
            createdBy: this.currentUser.userDetails,
            createdOn: resp.data.createdOn
          };
          //push current comment to the comments array
          this.comments.push(comment);

          //to keep scrollbar to the bottom
          this.scrollToCommentTop = false;
          this.commentDescription = '';

          this.toastr.success(resp.message);

          objpost["title"] = this.issue.title;
          //brodcast comment
          this.broadCastComment(objpost);
        }
        else
          this.toastr.error(resp.message);
      }, (error) => {

        this.toastr.error(error);
      }
    );
  }

  //load previous 10 comments on Load Previous Comment link
  public loadEarlierComments: any = () => {
    this.loadingPreviousChat = true;
    this.pageValue++;
    this.scrollToCommentTop = true;
    this.getComment();
  } //end of load previous chat of user

  //get issue on page load using issueId from url
  getIssue(issueId: string): any {
    this.openSpinner(true);
    this.issueService.getIssue(issueId, this.authToken).subscribe(
      (resp) => {
        if (resp.status === 200) {
          this.issue = {
            title: resp.data.title,
            description: resp.data.description,
            attachment: '',
            assignee: resp.data.assignedTo._id,
            status: resp.data.status,
            createdBy: resp.data.createdBy._id
          };
          this.currentAssignee = resp.data.assignedTo._id;
          //set local property attachment to the response's data-attachment
          this.attachment = resp.data.attachment;
        } else {
          this.toastr.error(resp.message);
        }
      }, (err) => {
        this.toastr.error(err);
      }
    );
    this.openSpinner(false);
  }

  //option for text editor
  public options: Object = {
    height: 200,
    charCounterCount: false,
    toolbarButtons: ['bold', 'italic', 'underline', 'paragraphFormat', 'fontFamily'],
    toolbarButtonsXS: ['bold', 'italic', 'underline', 'paragraphFormat', 'fontFamily'],
    toolbarButtonsSM: ['bold', 'italic', 'underline', 'paragraphFormat', 'fontFamily'],
    toolbarButtonsMD: ['bold', 'italic', 'underline', 'paragraphFormat', 'fontFamily']
  };

  //openspinner to toggle spinner
  openSpinner = (isLoading: boolean) => {
    if (isLoading)
      this.spinner.show();
    else
      this.spinner.hide();
  };//end of openSpinner function

  //getting all users form db to select box
  getAllUsers() {
    this.openSpinner(true);

    this.userService.getAllUsers(this.authToken).subscribe(
      (response) => {
        if (response.status === 200) {
          this.allUsers = response.data;
        }
        else
          this.toastr.warning(response.message);
      }, (err) => {
        this.toastr.error(err);
      }
    );
    this.openSpinner(false);
  };//end of getAllUsers

  //on click of delete photo
  deletePhoto = (photo: string) => {
    this.openSpinner(true);
    this.issueService.deletePhoto(this.currentIssueId, photo, this.authToken).subscribe(
      response => {

        //setting attachment property to fresh result
        this.attachment = response.data.attachment;
        this.toastr.success('Deleted Successfully');
        this.openSpinner(false);
      }, error => {
        this.toastr.error(error);
        this.openSpinner(false);
      });
  };//end of deletePhoto

  //on click of update information button
  updateInformation() {
    //to check if descritpion is empty or not
    if (this.issue.description.trim() === "") {
      this.toastr.error('Please fill description of the issue');
    }
    else {
      this.openSpinner(true);

      let dataObj = {
        title: this.issue.title,
        description: this.issue.description,
        assignedTo: this.issue.assignee,
        status: this.issue.status,
        issueId: this.currentIssueId,
        authToken: this.authToken,
        modifiedBy: this.currentUser.userDetails._id
      };
      this.issueService.updateIssue(dataObj).subscribe((res) => {
        if (res.status === 200) {
          this.toastr.success(res.message);
          //resetting form to default state
          this.updateForm.reset(this.issue);

          if (this.issue.assignee === this.currentAssignee) {
            this.broadCastNotification(res.data);
          } else {
            //to check if older assingee is in watcher list
            let userInWatcherList = this.watchers.find(x => x.watcherId._id === this.currentAssignee);
            if (userInWatcherList) {
              this.broadCastNotification(res.data);
            } else {
              let toUnsubscribeNotification = {
                issueId: this.currentIssueId,
                oldAssignee: this.currentAssignee,
                newAssignee: this.issue.assignee,
                createdBy: this.issue.createdBy,
                title: this.issue.title
              };
              this.updateWatcherList(toUnsubscribeNotification), (res) => {
                this.broadCastNotification(res.data);
              };
            }
          }
          this.currentAssignee = this.issue.assignee;
        } else {
          this.toastr.warning(res.message);
        }
      }, (err) => {
        this.toastr.error(err);
      });
      this.openSpinner(false);
    }
  }

  /*
      methods realted to socket
  */
  //method call once data is updated

  updateWatcherList = (data) => {
    this.socket.updateSubsrcibeUsers(data);
  };
  broadCastNotification = (data) => {
    this.socket.updateIssueNotification(data);
  };//end of broadCastNotificcation


  //method invoked, once comment is posted
  broadCastComment = (commentData) => {
    this.socket.commentNotification(commentData);
  };//end of broadCast Comment

  /**
   *  end of socket methods
   */
}
