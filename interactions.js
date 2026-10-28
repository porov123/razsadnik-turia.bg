(() => {
  const {varieties, slides} = nurseryContent;
  const modal = document.getElementById('variety-dialog');
  document.querySelectorAll('[data-variety]').forEach(button => {
    button.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const data = varieties[button.dataset.variety];
      if (!data) return;
      event.preventDefault();
      document.getElementById('modal-title').textContent = data.name;
      document.getElementById('modal-intro').textContent = data.intro;
      const details = document.getElementById('modal-details');
      details.replaceChildren();
      Object.entries(data.details).forEach(([key, value]) => {
        const term = document.createElement('dt'), description = document.createElement('dd');
        term.textContent = key;
        description.textContent = value;
        details.append(term, description);
      });
      modal.showModal();
    });
  });
  modal.querySelector('.close-dialog').addEventListener('click', () => modal.close());
  const outside = (dialog, event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  };
  modal.addEventListener('click', event => outside(modal, event));

  // Keep details open while reading, using their links, or navigating by keyboard.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.product').forEach((product, index) => {
    const photo = product.querySelector('.product-photo'), copy = product.querySelector('.product-copy');
    copy.id = `product-info-${index + 1}`;
    photo.setAttribute('aria-controls', copy.id);
    let pinned = false;
    const setActive = active => {
      product.classList.toggle('is-active', active);
      photo.setAttribute('aria-expanded', String(active));
      copy.setAttribute('aria-hidden', String(!active));
      copy.inert = !active;
    };
    setActive(false);
    photo.addEventListener('mouseenter', () => { if (finePointer.matches) setActive(true); });
    product.addEventListener('mouseleave', () => {
      if (finePointer.matches && !pinned && !product.contains(document.activeElement)) setActive(false);
    });
    photo.addEventListener('focus', () => { if (photo.matches(':focus-visible')) setActive(true); });
    product.addEventListener('focusout', event => {
      if (!pinned && !product.contains(event.relatedTarget) && !product.matches(':hover')) setActive(false);
    });
    const toggle = () => { pinned = !pinned; setActive(pinned); };
    photo.addEventListener('click', toggle);
    photo.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
    });
    product.addEventListener('keydown', event => {
      if (event.key === 'Escape') { pinned = false; photo.focus(); setActive(false); }
    });
  });

  const lightbox = document.getElementById('gallery-lightbox');
  const image = document.getElementById('gallery-main-image');
  const fullImage = document.getElementById('lightbox-image');
  const stage = lightbox.querySelector('.lightbox-stage');
  const zoom = document.getElementById('lightbox-zoom');
  let index = 4;
  const setZoom = expanded => {
    lightbox.classList.toggle('is-zoomed', expanded);
    zoom.setAttribute('aria-pressed', String(expanded));
    zoom.setAttribute('aria-label', expanded ? zoom.dataset.fitLabel : zoom.dataset.zoomLabel);
    zoom.textContent = expanded ? '−' : '＋';
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  };
  const select = next => {
    index = (next + slides.length) % slides.length;
    const slide = slides[index];
    image.src = slide.src;
    image.alt = slide.label;
    image.classList.toggle('is-document', Boolean(slide.document));
    document.getElementById('gallery-caption').textContent = slide.label;
    document.getElementById('gallery-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    document.querySelectorAll('[data-slide]').forEach(button => {
      const selected = Number(button.dataset.slide) === index;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    fullImage.src = slide.src;
    fullImage.alt = slide.label;
    fullImage.removeAttribute('width');
    fullImage.removeAttribute('height');
    document.getElementById('lightbox-caption').textContent = `${index + 1} / ${slides.length} · ${slide.label}`;
    setZoom(false);
  };
  document.querySelectorAll('[data-slide]').forEach(button => button.addEventListener('click', () => select(Number(button.dataset.slide))));
  document.getElementById('gallery-prev').addEventListener('click', () => select(index - 1));
  document.getElementById('gallery-next').addEventListener('click', () => select(index + 1));
  document.querySelector('.gallery-main').addEventListener('click', () => { setZoom(false); lightbox.showModal(); });
  lightbox.querySelector('.gallery-close').addEventListener('click', () => lightbox.close());
  document.getElementById('lightbox-prev').addEventListener('click', () => select(index - 1));
  document.getElementById('lightbox-next').addEventListener('click', () => select(index + 1));
  zoom.addEventListener('click', () => setZoom(!lightbox.classList.contains('is-zoomed')));
  fullImage.addEventListener('dblclick', () => setZoom(!lightbox.classList.contains('is-zoomed')));
  lightbox.addEventListener('click', event => outside(lightbox, event));
  lightbox.addEventListener('close', () => setZoom(false));
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && !lightbox.classList.contains('is-zoomed')) { event.preventDefault(); select(index - 1); }
    if (event.key === 'ArrowRight' && !lightbox.classList.contains('is-zoomed')) { event.preventDefault(); select(index + 1); }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); setZoom(true); }
    if (event.key === '-' || event.key === '0') { event.preventDefault(); setZoom(false); }
  });
  let touchStart;
  stage.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? [event.touches[0].clientX, event.touches[0].clientY] : null;
  }, {passive: true});
  stage.addEventListener('touchend', event => {
    if (!touchStart || lightbox.classList.contains('is-zoomed')) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart[0], dy = touch.clientY - touchStart[1];
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) select(index + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive: true});
  select(index);
})();
