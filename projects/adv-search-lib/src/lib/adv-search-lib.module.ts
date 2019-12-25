import { NgModule } from '@angular/core';
import { AdvSearchLibComponent } from './adv-search-lib.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AdvSearchLibComponent],
  imports: [
    FormsModule,
    CommonModule
  ],
  exports: [AdvSearchLibComponent]
})
export class AdvSearchLibModule { }
