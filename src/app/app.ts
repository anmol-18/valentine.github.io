import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

type Slide = 'gate' | 'memory-1' | 'memory-2' | 'memory-3' | 'ask' | 'yes';

type Memory = {
  title: string;
  subtitle: string;
  imageSrc: string;
  paragraph: string;
};

type FloatParticle = {
  leftPct: number;
  sizePx: number;
  durationS: number;
  delayS: number;
  opacity: number;
};

function normalizeName(v: string) {
  return v.trim().replace(/\s+/g, ' ').toLowerCase();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Change this to your girlfriend's name (must match the input to unlock).
  protected readonly gfName = 'Isha Todi';

  // Put your assets in /public so they load as /memories/... and /valentine.mp4
  protected readonly memories: Memory[] = [
    {
      title: 'Memory #1',
      subtitle: 'That day I couldn’t stop smiling',
      imageSrc: '/memories/memory-1.jpg',
      paragraph:
        'I still think about this moment all the time. Being with you makes everything feel softer, warmer, and more like home.',
    },
    {
      title: 'Memory #2',
      subtitle: 'You + me = my favorite place',
      imageSrc: '/memories/memory-2.jpg',
      paragraph:
        'You make the ordinary feel magical. I love the way you understand me, the way you laugh, and the way you make my world brighter.',
    },
    {
      title: 'Memory #3',
      subtitle: 'The little things I adore',
      imageSrc: '/memories/memory-3.jpg',
      paragraph:
        'I’m grateful for you, for us, and for every tiny moment in between. I can’t wait to make a million more memories with you.',
    },
  ];

  protected readonly videoSrc = '/valentine-message.mp4';

  protected readonly slide = signal<Slide>('gate');
  protected readonly enteredName = signal('');
  protected readonly gateError = signal<string | null>(null);

  protected readonly chosenDate = signal('');
  protected readonly chosenTime = signal('');
  protected readonly confirmed = signal(false);

  protected readonly noBtnX = signal<number | null>(null);
  protected readonly noBtnY = signal<number | null>(null);

  protected readonly displayName = computed(() => {
    const name = this.enteredName().trim();
    return name.length ? name : this.gfName;
  });

  protected readonly floaties: FloatParticle[] = Array.from({ length: 16 }, () => ({
    leftPct: rand(0, 100),
    sizePx: Math.round(rand(10, 20)),
    durationS: rand(10, 18),
    delayS: rand(0, 6),
    opacity: rand(0.25, 0.55),
  }));

  protected start() {
    this.gateError.set(null);

    const expected = normalizeName(this.gfName);
    const actual = normalizeName(this.enteredName());

    if (!actual) {
      this.gateError.set('Type your name first, pretty please.');
      return;
    }

    if (actual !== expected) {
      this.gateError.set('Oops… this page is only for my favorite person.');
      return;
    }

    this.slide.set('memory-1');
  }

  protected nextMemory() {
    const s = this.slide();
    if (s === 'memory-1') this.slide.set('memory-2');
    else if (s === 'memory-2') this.slide.set('memory-3');
    else if (s === 'memory-3') this.slide.set('ask');
  }

  protected back() {
    const s = this.slide();
    if (s === 'memory-1') this.slide.set('gate');
    else if (s === 'memory-2') this.slide.set('memory-1');
    else if (s === 'memory-3') this.slide.set('memory-2');
    else if (s === 'ask') this.slide.set('memory-3');
    else if (s === 'yes') this.slide.set('ask');
  }

  protected sayYes() {
    this.confirmed.set(false);
    this.slide.set('yes');
  }

  protected evadeNo(arena: HTMLElement, ev: PointerEvent) {
    const rect = arena.getBoundingClientRect();

    // Button sizes are fixed in CSS; used here to keep the button inside the arena.
    const btnW = 132;
    const btnH = 46;
    const padding = 14;

    const cursorX = ev.clientX - rect.left;
    const cursorY = ev.clientY - rect.top;

    const maxX = Math.max(padding, rect.width - btnW - padding);
    const maxY = Math.max(padding, rect.height - btnH - padding);

    // Try a few random positions; prefer one far from the cursor.
    let best = { x: rand(padding, maxX), y: rand(padding, maxY) };
    let bestDist = 0;

    for (let i = 0; i < 12; i++) {
      const x = rand(padding, maxX);
      const y = rand(padding, maxY);
      const dx = x + btnW / 2 - cursorX;
      const dy = y + btnH / 2 - cursorY;
      const dist = Math.hypot(dx, dy);
      if (dist > bestDist) {
        bestDist = dist;
        best = { x, y };
      }
    }

    this.noBtnX.set(clamp(best.x, padding, maxX));
    this.noBtnY.set(clamp(best.y, padding, maxY));
  }

  protected confirmPlan() {
    this.confirmed.set(true);
  }

  protected resetNoPosition() {
    this.noBtnX.set(null);
    this.noBtnY.set(null);
  }
}
