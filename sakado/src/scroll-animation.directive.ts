import { Directive, ElementRef, OnInit, OnDestroy, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollAnimation]',
})
export class ScrollAnimationDirective implements OnInit, OnDestroy {
  private observer: IntersectionObserver | undefined;
  private hasAnimated = false;

  @Input() threshold = 0.15;
  @Input() rootMargin = '0px 0px 0px 0px';
  @Input() animationDelay = 0;

  constructor(private el: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.setInitialState();

    // Run intersection observer setup only in browser (not SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.setupIntersectionObserver();
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private setInitialState() {
    const element = this.el.nativeElement;
    element.classList.add('scroll-animated-element');
    const animationType = element.getAttribute('data-animation') || 'fade-in-right';

    switch(animationType) {
      case 'fade-in-right':
        element.classList.add('animate-hidden-right');
        break;
      case 'fade-in-left':
        element.classList.add('animate-hidden-left');
        break;
      default:
        element.classList.add('animate-hidden-right');
    }

    if (this.animationDelay > 0) {
      element.style.setProperty('--animation-delay', `${this.animationDelay}ms`);
    }
  }

  private setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback or do nothing if IntersectionObserver is not supported
      return;
    }

    const options = {
      root: null,
      rootMargin: this.rootMargin,
      threshold: this.threshold,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.hasAnimated) {
          setTimeout(() => {
            this.animateElement();
          }, this.animationDelay);
          this.hasAnimated = true;
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private animateElement() {
    const element = this.el.nativeElement;

    element.classList.remove('animate-hidden-right', 'animate-hidden-left');
    element.classList.add('animate-active');

    const animationType = element.getAttribute('data-animation') || 'fade-in-right';
    element.classList.add(`animate-${animationType}`);
  }
}
