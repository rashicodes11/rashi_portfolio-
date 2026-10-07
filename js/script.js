/**
 * RASHI SHARMA - PORTFOLIO INTERACTIVITY SCRIPT
 * Handles theme switching, mobile drawer navigation, skills filtering,
 * clipboard copying for contact info, form validation, and scroll observer.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initScrollObserver();
  initSkillsFilter();
  initClipboardActions();
  initContactForm();
  initBackToTop();
  updateCurrentYear();
});

/* ==========================================================================
   1. THEME SWITCHER (Dark & Light Mode)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  // Retrieve stored theme or match system preference
  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'dark'); // Default to sleek dark

  document.documentElement.setAttribute('data-theme', initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('portfolio-theme', newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} theme`);
  });
}

/* ==========================================================================
   2. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!mobileToggle || !navMenu) return;

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle('open');
    mobileToggle.classList.toggle('open', isOpen);
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
  };

  mobileToggle.addEventListener('click', toggleMenu);

  // Close when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      toggleMenu();
    }
  });
}

/* ==========================================================================
   3. SCROLL SPY & ACTIVE NAV HIGHLIGHT
   ========================================================================== */
function initScrollObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          if (href === activeId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   4. SKILLS CATEGORY FILTER
   ========================================================================== */
function initSkillsFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  if (!filterBtns.length || !skillCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hidden');
          // Trigger smooth opacity/transform
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   5. COPY TO CLIPBOARD ACTIONS (Phone & Email)
   ========================================================================== */
function initClipboardActions() {
  const copyPhoneBtn = document.getElementById('copy-phone-btn');
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const phoneValue = document.getElementById('phone-number-value');
  const emailValue = document.getElementById('email-address-value');

  const copyTextToClipboard = async (text, buttonElement, originalLabel) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-https or older browsers
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }

      // Visual button feedback
      const textSpan = buttonElement.querySelector('.copy-text');
      if (textSpan) textSpan.textContent = 'Copied!';
      buttonElement.style.borderColor = 'var(--success-color)';
      buttonElement.style.color = 'var(--success-color)';

      showToast(`Copied "${text}" to clipboard!`);

      setTimeout(() => {
        if (textSpan) textSpan.textContent = originalLabel;
        buttonElement.style.borderColor = '';
        buttonElement.style.color = '';
      }, 2500);

    } catch (err) {
      showToast('Failed to copy to clipboard', true);
    }
  };

  if (copyPhoneBtn && phoneValue) {
    copyPhoneBtn.addEventListener('click', () => {
      copyTextToClipboard(phoneValue.textContent.trim(), copyPhoneBtn, 'Copy');
    });
  }

  if (copyEmailBtn && emailValue) {
    copyEmailBtn.addEventListener('click', () => {
      copyTextToClipboard(emailValue.textContent.trim(), copyEmailBtn, 'Copy');
    });
  }
}

/* ==========================================================================
   6. CONTACT FORM VALIDATION & INTERACTIVE SUBMIT
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const messageInput = document.getElementById('form-message');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const checkField = (input, isValid) => {
    const group = input.closest('.form-group');
    if (!isValid) {
      group.classList.add('has-error');
    } else {
      group.classList.remove('has-error');
    }
    return isValid;
  };

  // Real-time error removal on typing
  [nameInput, emailInput, messageInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        input.closest('.form-group').classList.remove('has-error');
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = checkField(nameInput, nameInput.value.trim().length > 0);
    const isEmailValid = checkField(emailInput, validateEmail(emailInput.value.trim()));
    const isMessageValid = checkField(messageInput, messageInput.value.trim().length > 0);

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      showToast('Please fix the errors in the form.', true);
      return;
    }

    // Simulate sending state
    submitBtn.disabled = true;
    const originalText = btnText.textContent;
    btnText.textContent = 'Sending Message...';

    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.textContent = originalText;
      form.reset();
      showToast('🎉 Thank you! Your message has been sent successfully.');
    }, 1200);
  });
}

/* ==========================================================================
   7. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   8. TOAST NOTIFICATION UTILITY
   ========================================================================== */
let toastTimeout;
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  clearTimeout(toastTimeout);

  toastMsg.textContent = message;
  toast.style.background = isError ? 'var(--danger-color)' : 'var(--success-color)';
  toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   9. CURRENT YEAR AUTO-UPDATE
   ========================================================================== */
function updateCurrentYear() {
  const yearElem = document.getElementById('current-year');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }
}
