const links = [...document.querySelectorAll('.side-nav a[href^="#"]')];
const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const setActive = () => {
  const y = window.scrollY + 180;
  let current = targets[0];
  for (const section of targets) if (section.offsetTop <= y) current = section;
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
};
window.addEventListener('scroll', setActive, { passive: true });
setActive();
