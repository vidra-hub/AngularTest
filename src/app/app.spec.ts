import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { Primes } from './primes/primes';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', async () => {
    const harness = await RouterTestingHarness.create();
    const routedComponent = await harness.navigateByUrl('/', Primes);
    expect(routedComponent).toBeTruthy();
  });

  it('should render the primes view at the root route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    const compiled = harness.routeNativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('First 100 Prime Numbers');
  });
});
