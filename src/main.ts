import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';
import { PasswordService } from './app/services/password.service';
import { FirestoreService } from './app/services/firestore.service';
import { AuthService } from './app/services/auth.service';
import { StorageService } from './app/services/storage.service';
import { EncryptionService } from './app/services/encryption.service';
import { ClipboardService } from './app/services/clipboard.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    PasswordService,
    FirestoreService,
    AuthService,
    StorageService,
    EncryptionService,
    ClipboardService
  ]
}).catch(err => console.error(err));