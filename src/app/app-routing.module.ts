import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Test1Component } from './test1/test1.component';

const routes: Routes = [
  {
    path: '',
    component: Test1Component,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
