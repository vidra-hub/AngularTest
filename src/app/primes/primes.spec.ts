import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Primes } from './primes';

describe('Primes', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Primes],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(Primes);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(Primes);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('First 100 Prime Numbers');
  });

  it('should compute exactly 100 primes ending in 541', () => {
    const fixture = TestBed.createComponent(Primes);
    const component = fixture.componentInstance as any;
    expect(component.primes.length).toBe(100);
    expect(component.primes[0]).toBe(2);
    expect(component.primes[99]).toBe(541);
  });
});
