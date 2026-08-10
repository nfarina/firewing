export function smoothScroll(container: HTMLElement, offset: number) {
  const start = container.scrollTop;
  const change = offset - start;
  const startTime = performance.now();
  const duration = 750;

  function easeOutExpo(t: number, b: number, c: number, d: number) {
    return c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
  }

  function animateScroll(currentTime: number) {
    const timeElapsed = currentTime - startTime;
    const nextScrollTop = easeOutExpo(timeElapsed, start, change, duration);

    container.scrollTop = nextScrollTop;

    if (timeElapsed < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      // Ensure we set to the final value if the animation is complete
      container.scrollTop = offset;
    }
  }

  requestAnimationFrame(animateScroll);
}
