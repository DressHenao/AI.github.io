/**
 * BLC AI : Main Application Logic
 * Interactive 7-Part Prompt Builder, Model Directory Filter, Copyable Helper Prompts, Smooth Nav.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Interactive 7-Part Prompt Architecture Builder
  const inputMedia = document.getElementById('input-media');
  const inputSubject = document.getElementById('input-subject');
  const inputAction = document.getElementById('input-action');
  const inputPlace = document.getElementById('input-place');
  const inputLighting = document.getElementById('input-lighting');
  const inputCamera = document.getElementById('input-camera');
  const inputStyle = document.getElementById('input-style');

  const promptResultBox = document.getElementById('master-prompt-output');
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const samplePromptBtn = document.getElementById('sample-prompt-btn');
  const clearPromptBtn = document.getElementById('clear-prompt-btn');

  const sampleData = {
    media: 'Cinematic 35mm film still',
    subject: 'a master Swiss horologist in a linen workcoat',
    action: 'calibrating a tourbillon gear mechanism with sapphire tweezers',
    place: 'an antique wooden attic workshop in Geneva, rain washing the window panes',
    lighting: 'warm 3200K tungsten practical lamp casting soft dramatic shadows',
    camera: 'ARRI Alexa Mini, 50mm Master Prime lens at T1.3, shallow depth of field',
    style: 'Kodak Vision3 500T film color grade, organic analog halation, quiet editorial atmosphere'
  };

  function updateMasterPrompt() {
    if (!promptResultBox) return;

    const media = inputMedia ? inputMedia.value.trim() : '';
    const subject = inputSubject ? inputSubject.value.trim() : '';
    const action = inputAction ? inputAction.value.trim() : '';
    const place = inputPlace ? inputPlace.value.trim() : '';
    const lighting = inputLighting ? inputLighting.value.trim() : '';
    const camera = inputCamera ? inputCamera.value.trim() : '';
    const style = inputStyle ? inputStyle.value.trim() : '';

    const hasAnyContent = media || subject || action || place || lighting || camera || style;

    if (!hasAnyContent) {
      promptResultBox.innerHTML = `
        <span class="prompt-empty-hint">
          Start typing in the questions above (or click "Try Sample") to preview your compiled master prompt here...
        </span>
      `;
      return;
    }

    let parts = [];
    if (media) parts.push(`<span class="tok-media">"${escapeHtml(media)}</span>`);
    else parts.push(`<span class="tok-media">"Visual asset</span>`);

    if (subject) parts.push(`of <span class="tok-subj">${escapeHtml(subject)}</span>`);
    if (action) parts.push(`<span class="tok-act">${escapeHtml(action)}</span>`);
    if (place) parts.push(`located in <span class="tok-loc">${escapeHtml(place)}</span>.`);
    if (lighting) parts.push(`<span class="tok-light">Lighting: ${escapeHtml(lighting)}.</span>`);
    if (camera) parts.push(`<span class="tok-cam">Camera: ${escapeHtml(camera)}.</span>`);
    if (style) parts.push(`<span class="tok-style">Aesthetic tone: ${escapeHtml(style)}.</span>`);

    // Clean suffix without any double dashes
    parts.push(`<span class="tok-style">[Aspect Ratio: 16:9, Ultra High Detail]"</span>`);

    promptResultBox.innerHTML = parts.join(' ');
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const allInputs = [inputMedia, inputSubject, inputAction, inputPlace, inputLighting, inputCamera, inputStyle];
  allInputs.forEach((inputEl) => {
    if (inputEl) {
      inputEl.addEventListener('input', updateMasterPrompt);
    }
  });

  if (samplePromptBtn) {
    samplePromptBtn.addEventListener('click', () => {
      if (inputMedia) inputMedia.value = sampleData.media;
      if (inputSubject) inputSubject.value = sampleData.subject;
      if (inputAction) inputAction.value = sampleData.action;
      if (inputPlace) inputPlace.value = sampleData.place;
      if (inputLighting) inputLighting.value = sampleData.lighting;
      if (inputCamera) inputCamera.value = sampleData.camera;
      if (inputStyle) inputStyle.value = sampleData.style;
      updateMasterPrompt();
    });
  }

  if (clearPromptBtn) {
    clearPromptBtn.addEventListener('click', () => {
      allInputs.forEach((inputEl) => {
        if (inputEl) inputEl.value = '';
      });
      updateMasterPrompt();
    });
  }

  if (copyPromptBtn && promptResultBox) {
    copyPromptBtn.addEventListener('click', () => {
      const textToCopy = promptResultBox.innerText;
      if (!textToCopy || textToCopy.includes('Start typing in the questions above')) {
        alert('Please fill in some prompt fields first!');
        return;
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        const orig = copyPromptBtn.textContent;
        copyPromptBtn.textContent = 'Copied Prompt!';
        setTimeout(() => {
          copyPromptBtn.textContent = orig;
        }, 2200);
      });
    });
  }

  // Initialize prompt box preview
  updateMasterPrompt();

  // 2. Copyable Helper Prompts in "When to Use AI"
  document.querySelectorAll('.helper-copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const parentBox = btn.closest('.helper-example-box');
      if (parentBox) {
        const snippet = parentBox.querySelector('.helper-prompt-snippet');
        if (snippet) {
          const text = snippet.innerText;
          navigator.clipboard.writeText(text).then(() => {
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
              btn.textContent = original;
            }, 2000);
          });
        }
      }
    });
  });

  // 3. Model Directory Filter Tabs
  const modelTabs = document.querySelectorAll('.model-tab-btn');
  const modelCards = document.querySelectorAll('.model-item');

  modelTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      modelTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      modelCards.forEach((card) => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Smooth Anchor Navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // 5. Role Perspective Gate & Navigation Filter
  const rolePages = {
    pm: ['index.html', 'how-to-produce.html', 'time-calculator.html'],
    art: ['index.html', 'the-bible.html', 'how-to-produce.html', 'when-to-use.html', 'model-stack.html', 'time-calculator.html'],
    client: ['index.html', 'how-to-produce.html']
  };

  const roleLabels = {
    pm: 'Projekt Leitung',
    art: 'Art/Design',
    client: 'Client/others'
  };

  function applyRole(role) {
    if (!role || !rolePages[role]) role = 'art';
    localStorage.setItem('blc_role', role);
    sessionStorage.setItem('blc_role', role);

    const allowed = rolePages[role];

    // Filter Navigation Bar Links
    document.querySelectorAll('.nav-links li').forEach((li) => {
      const link = li.querySelector('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (allowed.includes(href)) {
        li.style.display = '';
      } else {
        li.style.display = 'none';
      }
    });

    // Filter Home Directory Portals
    document.querySelectorAll('.portal-card').forEach((card) => {
      const href = card.getAttribute('href');
      if (allowed.includes(href)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    // Update Role Pill in Nav
    const currentRoleEl = document.getElementById('currentRoleName');
    if (currentRoleEl) {
      currentRoleEl.textContent = roleLabels[role] || 'Art/Design';
    }
  }

  const roleGate = document.getElementById('roleGate');
  const savedRole = sessionStorage.getItem('blc_role') || localStorage.getItem('blc_role');
  const isGateHash = window.location.hash === '#gate';

  if (roleGate) {
    // We are on index.html with the Role Gate Screen
    if (!savedRole || isGateHash) {
      document.body.classList.add('gate-active');
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    } else {
      document.body.classList.remove('gate-active');
      applyRole(savedRole);
    }

    document.querySelectorAll('.role-gate-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const chosenRole = btn.getAttribute('data-role');
        document.body.classList.remove('gate-active');
        if (window.location.hash === '#gate') {
          history.replaceState(null, '', window.location.pathname);
        }
        applyRole(chosenRole);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
      });
    });
  } else {
    // We are on an inner page
    const activeRole = savedRole || 'art';
    applyRole(activeRole);

    // If an inner page is not allowed for this role, bounce back to index.html
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath !== 'index.html' && rolePages[activeRole] && !rolePages[activeRole].includes(currentPath)) {
      window.location.href = 'index.html';
    }
  }

  // Role Switch Button in Top Navigation
  const switchRoleBtn = document.getElementById('switchRoleBtn');
  if (switchRoleBtn) {
    switchRoleBtn.addEventListener('click', () => {
      localStorage.removeItem('blc_role');
      sessionStorage.removeItem('blc_role');

      const isHome = roleGate !== null;
      if (isHome) {
        document.body.classList.add('gate-active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
      } else {
        window.location.href = 'index.html#gate';
      }
    });
  }

  // 6. Pipeline Image Lightbox Modal
  const stepImages = document.querySelectorAll('.step-card-image-wrap img');
  if (stepImages.length > 0) {
    let lightbox = document.querySelector('.image-lightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'image-lightbox';
      lightbox.innerHTML = `
        <div class="image-lightbox-content">
          <button class="image-lightbox-close" aria-label="Close lightbox">&times;</button>
          <img class="image-lightbox-img" src="" alt="Enlarged pipeline asset preview">
          <p class="image-lightbox-caption"></p>
        </div>
      `;
      document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('.image-lightbox-img');
    const lightboxCaption = lightbox.querySelector('.image-lightbox-caption');
    const closeBtn = lightbox.querySelector('.image-lightbox-close');

    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxCaption.textContent = alt || '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 250);
    }

    stepImages.forEach((img) => {
      img.addEventListener('click', () => {
        openLightbox(img.src, img.alt);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

});
