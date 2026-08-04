/* Custom Neon Cursor Follower Logic */
document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  const follower = document.createElement('div');
  follower.className = 'custom-cursor-follower';
  
  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  let posX = 0, posY = 0;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  function animateFollower() {
    posX += (mouseX - posX) / 6;
    posY += (mouseY - posY) / 6;

    follower.style.left = `${posX}px`;
    follower.style.top = `${posY}px`;

    requestAnimationFrame(animateFollower);
  }

  animateFollower();

  // Attach hover effect on interactive elements
  const addHoverState = () => document.body.classList.add('cursor-hover');
  const removeHoverState = () => document.body.classList.remove('cursor-hover');

  function bindHoverEvents() {
    const interactiveElements = document.querySelectorAll('a, button, input, select, .sidebar-link, .glass-card, .topbar-btn, .notif-item');
    interactiveElements.forEach(el => {
      el.removeEventListener('mouseenter', addHoverState);
      el.removeEventListener('mouseleave', removeHoverState);
      el.addEventListener('mouseenter', addHoverState);
      el.addEventListener('mouseleave', removeHoverState);
    });
  }

  bindHoverEvents();
  // Observe DOM changes to rebind cursor events dynamically
  const observer = new MutationObserver(bindHoverEvents);
  observer.observe(document.body, { childList: true, subtree: true });
});
