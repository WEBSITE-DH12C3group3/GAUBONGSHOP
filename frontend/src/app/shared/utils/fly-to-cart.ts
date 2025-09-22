export function flyToCart(sourceEl: HTMLElement, cartIconSelector = '#cartIcon') {
  try {
    const cart = document.querySelector(cartIconSelector) as HTMLElement | null;
    if (!sourceEl || !cart) return;

    const srcRect = sourceEl.getBoundingClientRect();
    const dstRect = cart.getBoundingClientRect();

    const ghost = sourceEl.cloneNode(true) as HTMLElement;
    ghost.style.position = 'fixed';
    ghost.style.left = `${srcRect.left}px`;
    ghost.style.top = `${srcRect.top}px`;
    ghost.style.width = `${srcRect.width}px`;
    ghost.style.height = `${srcRect.height}px`;
    ghost.style.zIndex = '9999';
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '0.9';
    ghost.style.transform = 'translate(0,0) scale(1)';
    ghost.style.transition = 'transform 600ms cubic-bezier(.2,.8,.2,1), opacity 600ms';

    document.body.appendChild(ghost);
    requestAnimationFrame(() => {
      const dx = dstRect.left - srcRect.left;
      const dy = dstRect.top - srcRect.top;
      ghost.style.transform = `translate(${dx}px, ${dy}px) scale(0.3)`;
      ghost.style.opacity = '0.2';
    });
    setTimeout(() => ghost.remove(), 650);

    cart.classList.add('cart-pulse');
    setTimeout(() => cart.classList.remove('cart-pulse'), 500);
  } catch {}
}
