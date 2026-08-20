import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ContactForm } from './contact-form';

describe('ContactForm', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactForm],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ContactForm);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    const fixture = TestBed.createComponent(ContactForm);
    const component = fixture.componentInstance as any;
    expect(component.form.invalid).toBe(true);
  });

  it('should be valid with proper values', () => {
    const fixture = TestBed.createComponent(ContactForm);
    const component = fixture.componentInstance as any;
    component.form.setValue({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    });
    expect(component.form.valid).toBe(true);
  });
});
