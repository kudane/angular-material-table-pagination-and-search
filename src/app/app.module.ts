import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './material.module';
import { SharedModule } from './shared.module';

import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserAnimationsModule, SharedModule, MaterialModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
