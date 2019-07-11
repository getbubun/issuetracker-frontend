import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { first } from 'rxjs/operators';
import {
  AuthService,
  FacebookLoginProvider,
  GoogleLoginProvider
} from 'angular-6-social-login';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  model: any = {};
  //private user: SocialUser;
  private loggedIn: boolean;
  constructor(private socialAuthService: AuthService,
    private userService: UserService, private spinner: NgxSpinnerService, public authenticationService: AuthenticationService, private toastr: ToastrService,
    private router: Router, private http: HttpClient) { }

  ngOnInit() {
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/dashboard']);
    }
  }


  //openspinner to toggle spinner
  openSpinner = (isLoading: boolean) => {
    if (isLoading)
      this.spinner.show();
    else
      this.spinner.hide();
  };//end of openSpinner function

  login() {

    this.openSpinner(true);
    this.authenticationService.login(this.model).subscribe(data => {
      this.router.navigate(['/dashboard'])
      this.toastr.success(data.message);
    }, error => {
      this.openSpinner(false);
      this.toastr.error(error.message);
    });
  }
  public signInSocial(using: String): void {
    let socialPlatformProvider = "";
    console.log(using)
    if (using === "Google") {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
      this.socialAuthService.signIn(socialPlatformProvider).then(userData => {
        console.log('userData hai')
        console.log(userData)
        this.openSpinner(true);
        this.apiConnection(userData);
      });
    }
    else {
      this.http.get('http://localhost:3000/api/authentication/facebook/start').subscribe();
    }
    // //socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    // this.socialAuthService.signIn(socialPlatformProvider).then(userData => {
    //   console.log('userData hai')
    //   console.log(userData)
    //   this.openSpinner(true);
    //   this.apiConnection(userData);
    // });
  }
  goToSignUp() {
    this.router.navigate(['/signup']);
  }
  apiConnection(data) {
    let socialObj = {
      idToken: data.idToken,
      type: 'google'
    };
    this.authenticationService.signInSocial(socialObj)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigate(['/dashboard'])
        },
        error => {
          this.openSpinner(false);
          this.toastr.error(error);
        });
  }
}
