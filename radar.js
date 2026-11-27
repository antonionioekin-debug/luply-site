
// ========================================
// LUPLY RADAR — INTERACTIVE EXPERIENCE
// ========================================

(() => {

  const radar = document.getElementById('luply-radar');

  if (!radar) return;

  const slider = radar.querySelector('#radar-slider');
  const distance = radar.querySelector('#radar-distance');
  const count = radar.querySelector('#radar-count');
  const range = radar.querySelector('#radar-range');
  const pulse = radar.querySelector('#radar-pulse');
  const objects = radar.querySelectorAll('.radar-object');

  if (!slider || !distance || !count || !range || !pulse) {
    return;
  }

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  // Aggiornamento del raggio e degli oggetti

  function updateRadar() {

    const radius = Number(slider.value);
    const maxRadius = Number(slider.max);

    let visibleObjects = 0;

    range.style.setProperty(
      '--radar-scale',
      radius / maxRadius
    );

    objects.forEach(object => {

      const objectDistance = Number(object.dataset.distance);

      const isActive = objectDistance <= radius;

      object.classList.toggle('is-active', isActive);

      if (isActive) {
        visibleObjects++;
      }

    });

    distance.textContent = `${radius} km`;
    count.textContent = visibleObjects;

    slider.setAttribute(
      'aria-valuetext',
      `${radius} chilometri`
    );

  }

  // Impulso luminoso

  function triggerPulse() {

    if (reducedMotion.matches) return;

    const radius = Number(slider.value);

    pulse.setAttribute(
      'r',
      140 * radius / Number(slider.max)
    );

    pulse.classList.remove('is-pulsing');

    // Riavvia l'animazione

    pulse.getBoundingClientRect();

    pulse.classList.add('is-pulsing');

  }

  // Interazione con il cursore

  slider.addEventListener('input', updateRadar);
  slider.addEventListener('change', triggerPulse);

  pulse.addEventListener('animationend', () => {
    pulse.classList.remove('is-pulsing');
  });

  // Inizializzazione

  updateRadar();

})();