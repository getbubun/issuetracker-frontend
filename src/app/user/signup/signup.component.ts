import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  registerForm: FormGroup;
  constructor(private _router: Router, private toastr: ToastrService, private userService: UserService, private spinner: NgxSpinnerService,
    private fb: FormBuilder, private el: ElementRef) { }

  ngOnInit() {
    this.createRegisterForm();
  }
  createRegisterForm() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      profilePic: ['', Validators.required]
    }, { validator: [this.fileUploadType, this.passwordMatchValidator] });
  };
  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : { 'mismatch': true };
  }

  fileUploadType(g: FormGroup) {
    let file = g.get('profilePic').value;
    if (file) {
      const extension = file.split('.');
      let val = extension[extension.length - 1];

      if (val === "jpeg" || val === "png" || val === "jpg") {
        return null;
      }
      else return { 'fileextension': true }
    }
    return null;
  }
  openSpinner = (isLoading: boolean) => {
    if (isLoading)
      this.spinner.show();
    else
      this.spinner.hide();
  };//end of openSpinner function

  //on login navbar link click
  goToLogin() {
    this._router.navigate(['/login']);
  }
  register() {

    // this.openSpinner(true);
    let formData = new FormData();

    //locate the file element meant for the file upload.
    let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#profilePic');
    //get the total amount of files attached to the file input.
    let fileCount: number = inputEl.files.length;
    //check if the filecount is greater than zero, to be sure a file was selected.
    if (fileCount > 0) { // a file was selected
      //append the key name 'photo' with the first file in the element
      formData.append('photo', inputEl.files.item(0));
    }

    console.log(inputEl.files.item(0))

    formData.append('name', this.registerForm.value.name);
    formData.append('email', this.registerForm.value.email);
    formData.append('password', this.registerForm.value.password);

    console.log('formData')
    console.log(formData)
    this.userService.register(formData).subscribe((res) => {
      if (res.status === 200) {
        console.log(res)
        this.toastr.success(res.message);
        this.registerForm.reset();
      } else {
        this.toastr.error(res.message);
      }
    },error=>{
      console.log(error)
      this.toastr.error(error.message);
    });
  }
}
