import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { BsDropdownModule, TabsModule } from 'ngx-bootstrap';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [NavComponent],
  imports: [
    CommonModule, BsDropdownModule.forRoot(), RouterModule
  ],
  exports:[
    NavComponent
  ]
})
export class LayoutModule { }

