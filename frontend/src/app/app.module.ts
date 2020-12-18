import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { WebcamModule } from 'ngx-webcam'

import { AppComponent } from './app.component';
import { MainComponent } from './components/main.component';
import { CaptureComponent } from './components/capture.component';
import {CameraService} from './camera.service';
import { LoginComponent } from './components/login.component';

const ROUTES: Routes = [
	{ path: '', component: LoginComponent },
	{ path: 'main', component: MainComponent },
	{ path: 'capture', component: CaptureComponent },
	{ path: '**', redirectTo: '/', pathMatch: 'full' }
]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent, MainComponent, CaptureComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
		RouterModule.forRoot(ROUTES),
		WebcamModule,
  ],
  providers: [ CameraService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
