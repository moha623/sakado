import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../../environments/environment';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { provideFirebaseApp } from '@angular/fire/app';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { AppRoutingModule } from '../app-routing.module';

import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { provideStorage, getStorage } from '@angular/fire/storage';
import { getAuth, provideAuth } from '@angular/fire/auth';
@NgModule({
  imports: [
    BrowserModule,
    AngularFireAuthModule,
    AngularFireModule,

    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    // Removed provideStorage from imports
  ],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAuth(() => getAuth()),
  ],
  exports: [AngularFireModule, AngularFireAuthModule, AngularFirestoreModule],
})
export class FirebaseModule {}
