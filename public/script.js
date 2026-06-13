const typedWords = ['Web Developer', 'UI/UX Designer', 'Digital Creator'];
const typedTextEl = document.getElementById('typedText');
const loaderScreen = document.getElementById('loaderScreen');
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');
const customCursor = document.getElementById('customCursor');
const navToggle = document.querySelector('.nav-toggle');
const navbarLinks = document.getElementById('navbarLinks');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const heroCanvas = document.getElementById('heroCanvas');

let typedIndex = 0;
let charIndex = 0;
let deleting = false;
let currentText = '';

function typeLoop() {
  const activeWord = typedWords[typedIndex];
  if (!deleting) {
    currentText = activeWord.slice(0, charIndex + 1);
    typedTextEl.textContent = currentText;
    charIndex++;
    if (charIndex === activeWord.length) {
      deleting = true;
      setTimeout(typeLoop, 1800);
      return;
    }
  } else {
    currentText = activeWord.slice(0, charIndex - 1);
    typedTextEl.textContent = currentText;
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      typedIndex = (typedIndex + 1) % typedWords.length;
    }
  }
  setTimeout(typeLoop, deleting ? 80 : 120);
}

typeLoop();

window.addEventListener('mousemove', (event) => {
  customCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
});

window.addEventListener('load', () => {
  setTimeout(() => {
    loaderScreen.classList.add('hidden');
  }, 2000);
});

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const payload = {
    name: formData.get('name').trim(),
    email: formData.get('email').trim(),
    phone: formData.get('phone').trim(),
    service: formData.get('service').trim(),
    budget: formData.get('budget').trim(),
    message: formData.get('message').trim(),
  };

  formFeedback.textContent = 'Sending message...';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.success) {
      formFeedback.textContent = data.message;
      contactForm.reset();
      contactForm.classList.add('sent');
      setTimeout(() => contactForm.classList.remove('sent'), 1400);
    } else {
      formFeedback.textContent = data.message || 'Submission failed. Please try again.';
    }
  } catch (error) {
    formFeedback.textContent = 'Unable to send message. Please try again later.';
  }
});

navToggle.addEventListener('click', () => {
  navbarLinks.classList.toggle('open');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navbarLinks.classList.remove('open');
  });
});

const revealItems = document.querySelectorAll('.reveal-item');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealItems.forEach((item) => observer.observe(item));

window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + window.innerHeight / 2;
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    if (scrollPos >= sectionTop && scrollPos < sectionTop + section.offsetHeight) {
      document.querySelectorAll('.nav-link').forEach((link) => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href='#${section.id}']`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
});

function createParticles() {
  if (!heroCanvas) return;
  const ctx = heroCanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  heroCanvas.width = heroCanvas.offsetWidth * dpr;
  heroCanvas.height = heroCanvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);
  const width = heroCanvas.offsetWidth;
  const height = heroCanvas.offsetHeight;

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    radius: 1.3 + Math.random() * 2,
    alpha: 0.2 + Math.random() * 0.35,
  }));

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 212, 255, ${particle.alpha})`;
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      for (let j = index + 1; j < particles.length; j++) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.strokeStyle = `rgba(155, 48, 255, ${0.12 - dist * 0.0011})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

window.addEventListener('resize', createParticles);
createParticles();
