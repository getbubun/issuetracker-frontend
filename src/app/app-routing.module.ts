import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './user/login/login.component';
import { SignupComponent } from './user/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { CreateComponent } from './issue/create/create.component';
import { MyListComponent } from './issue/my-list/my-list.component';
import { ViewComponent } from './issue/view/view.component';
import { SearchComponent } from './issue/search/search.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard', component: DashboardComponent
      },
      {
        path: 'create', component: CreateComponent
      },
      {
        path: 'my-list', component: MyListComponent
      },
      {
        path: 'search', component: SearchComponent
      },
      {
        path: 'view/:issueId', component: ViewComponent
      }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation:'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
