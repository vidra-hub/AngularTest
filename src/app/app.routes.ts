import { Routes } from '@angular/router';
import { Primes } from './primes/primes';
import { ContactForm } from './contact-form/contact-form';

export const routes: Routes = [
  { path: '', component: Primes },
  { path: 'contact', component: ContactForm },
  { path: '**', redirectTo: '' },
];
