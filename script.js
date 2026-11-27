(() => {
  // Paste your public Google Drive share link below (e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing)
  const RESUME_DRIVE_URL = '';

  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const projectCards = Array.from(document.querySelectorAll('.project-card'));
  const copyBtn = document.getElementById('copy-email');
  const toast = document.getElementById('toast');
  const yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Theme management
  function syncThemeButton(theme) {
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
    );
  }

  syncThemeButton(root.getAttribute('data-theme') || 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      syncThemeButton(next);
      try {
        localStorage.setItem('portfolio-theme', next);
      } catch (_) {}
    });
  }

  // Mobile navigation
  if (menuToggle && mobileNav) {
    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
    };

    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Project category counts & filtering
  const categories = ['all', 'risk', 'automation'];
  categories.forEach((cat) => {
    const countEl = document.querySelector(`[data-count="${cat}"]`);
    if (!countEl) return;
    const count =
      cat === 'all'
        ? projectCards.length
        : projectCards.filter((card) => (card.dataset.category || '').split(/\s+/).includes(cat)).length;
    countEl.textContent = String(count);
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.filter || 'all';
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      projectCards.forEach((card) => {
        const cardCats = (card.dataset.category || '').split(/\s+/);
        const visible = selected === 'all' || cardCats.includes(selected);
        card.hidden = !visible;
      });
    });
  });

  // Active section highlight in nav
  const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
          });
        });
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );
    sections.forEach((sec) => observer.observe(sec));
  }

  // Copy email with toast feedback
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 2400);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email || '';
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        showToast('Email copied to clipboard');
      } catch (_) {
        showToast(email);
      }
    });
  }

  function toGoogleDriveDownloadUrl(url) {
    const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    return match ? `https://drive.google.com/uc?export=download&id=${match[1]}` : url;
  }

  const resumeLinks = Array.from(document.querySelectorAll('[data-resume-link]'));
  if (RESUME_DRIVE_URL.trim()) {
    const downloadUrl = toGoogleDriveDownloadUrl(RESUME_DRIVE_URL.trim());
    resumeLinks.forEach((link) => {
      link.href = downloadUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    });
  } else {
    resumeLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        showToast('Add your Google Drive link to RESUME_DRIVE_URL in script.js');
      });
    });
  }
})();
