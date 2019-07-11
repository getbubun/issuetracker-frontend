import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {

  userName: any;
  photoUrl: SafeUrl;
  disconnectedSocket: Boolean = true;
  currentUserSubscription: Subscription;
  authToken: string = '';
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.currentUserSubscription.unsubscribe();
  }
  constructor(private authService: AuthenticationService,
    public sanitizer: DomSanitizer, private route: ActivatedRoute, private socketService: SocketService, private toastr: ToastrService,
    private router: Router) {
  }
  ngOnInit() {

    this.socketService.disconnectedSocket();

    this.currentUserSubscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.authToken = user.authToken;
        this.userName = user.userDetails.name;
        let photo = user.userDetails.photoUrl;
        if (user.userDetails.provider === "local")
          this.photoUrl = environment.baseUrl + "" + photo;
        else
          this.photoUrl = photo;
        // this.photoUrl = this.sanitizer.bypassSecurityTrustUrl(photo);
      }


      //making socket connection
      this.makeSocketConnection();
      //activating socket to receive changes and comments
      this.getBroadCast();
    });
  }

  makeSocketConnection = () => {
    this.socketService.verifyUser().subscribe(
      (data) => {
        this.disconnectedSocket = false;
        this.socketService.setUser(this.authToken);
      });
  };

  protected getBroadCast: any = () => {
    this.socketService.registerForNotification()
      .subscribe((data) => {


        this.toastr.success('Changes in issue ' + data.title + ' (' + data.issueId + ') Click to follow', '', {
          disableTimeOut: true,
          closeButton: true
        })
          .onTap
          .subscribe(() => this.toasterClickedHandler(data.issueId));

      }); //end of register for notifications subscribe

    this.socketService.registerForCommentNotification()
      .subscribe((data) => {
        this.toastr.success('Issue ' + data.title + ' (' + data.issueId + ') received a comment. Click to follow', '', {
          disableTimeOut: true,
          closeButton: true
        })
          .onTap
          .subscribe(() => this.toasterClickedHandler(data.issueId));
      });
    this.socketService.registerForNewIssueCreated()
      .subscribe((data) => {
        this.toastr.success('A new issue has been assigned to you. (' + data.issueId + '). Click to follow', '', {
          disableTimeOut: true,
          closeButton: true
        })
          .onTap
          .subscribe(() => this.toasterClickedHandler(data.issueId));
      });
    this.socketService.registerForUserUpdatedNotifications()
      .subscribe((data) => {
        this.toastr.success('Issue ' + data.title + ' (' + data.issueId + ') is updated. Click to follow', '', {
          disableTimeOut: true,
          closeButton: true
        })
          .onTap
          .subscribe(() => this.toasterClickedHandler(data.issueId));
      });
  } //end get message from a user

  toasterClickedHandler(data) {
    this.router.navigate(['/view/' + data]);

  }
  loggedIn() {
    return this.authService.loggedIn();
  }
  logout() {
    this.authService.logout();
  }
}
