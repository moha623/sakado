import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

@NgModule({
  imports: [AppModule, ServerModule],
  providers: [ ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}

import { Routes } from '@angular/router';
import { RenderMode } from '@angular/ssr';

export const serverRoutes = [
  {
    path: '**',
    renderMode: RenderMode.Server
  }
] as const;
