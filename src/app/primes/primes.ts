import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  selector: 'app-primes',
  imports: [RouterLink],
  templateUrl: './primes.html',
  styleUrl: './primes.css',
})
export class Primes {
  protected readonly title = 'First 100 Prime Numbers';
  protected readonly primes = firstNPrimes(100);
}
