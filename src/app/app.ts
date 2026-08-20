import { Component } from '@angular/core';

function firstNPrimes(count: number): number[] {
  const primes: number[] = [];
  let candidate = 2;
  while (primes.length < count) {
    if (primes.every((p) => candidate % p !== 0)) {
      primes.push(candidate);
    }
    candidate++;
  }
  return primes;
}

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = 'First 100 Prime Numbers';
  protected readonly primes = firstNPrimes(100);
}
