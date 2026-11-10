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
});
