import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { LayoutModule } from '../layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SignupComponent } from './signup/signup.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';

@NgModule({
  imports: [
    CommonModule, LayoutModule,NgxSpinnerModule, FormsModule, ReactiveFormsModule
  ],
  declarations: [LoginComponent, SignupComponent, ChangepasswordComponent]
})
export class UserModule { }
