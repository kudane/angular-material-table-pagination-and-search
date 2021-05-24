import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MaterialModule } from './material.module';
import { SharedModule } from './shared.module';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, SharedModule, MaterialModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
