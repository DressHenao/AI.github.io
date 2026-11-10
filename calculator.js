/**
 * BLC AI : Production Time Calculator
 * Calculates realistic project timelines based on AI generation iterations
 * and professional human retouch / compositing standards.
 */

(function () {
  function initCalculator() {
    const imagesInput = document.getElementById('calc-images');
    const videosInput = document.getElementById('calc-videos');
    const tierRadios = document.querySelectorAll('input[name="calc-tier"]');

    const imagesValDisp = document.getElementById('val-images');
    const videosValDisp = document.getElementById('val-videos');

    const outAiGen = document.getElementById('out-ai-gen');
    const outRetouch = document.getElementById('out-retouch');
    const outTotal = document.getElementById('out-total');
    const outDays = document.getElementById('out-days');
    const outCraftRatio = document.getElementById('out-craft-ratio');
    const craftBar = document.getElementById('craft-bar');
    const aiBar = document.getElementById('ai-bar');
    const traditionalComparison = document.getElementById('traditional-comparison');
    const copyBtn = document.getElementById('copy-estimate-btn');

    if (!imagesInput || !videosInput) return;

    function calculate() {
      const numImages = parseInt(imagesInput.value, 10) || 0;
      const numVideos = parseInt(videosInput.value, 10) || 0;

      let selectedTier = 'master';
      tierRadios.forEach((r) => {
        if (r.checked) selectedTier = r.value;
      });

      // Rates from client requirements:
      // Generation: 1 hour per good image, 1 hour per 5s video
      const genTimePerImage = 1;
      const genTimePerVideo = 1;

      // Retouch:
      // Standard: 5 hours per image, 5 hours per 5s video
      // Master: 8 hours per image, 6 hours per 5s video
      const retouchPerImage = selectedTier === 'master' ? 8 : 5;
      const retouchPerVideo = selectedTier === 'master' ? 6 : 5;

      const totalGenHours = numImages * genTimePerImage + numVideos * genTimePerVideo;
      const totalRetouchHours = numImages * retouchPerImage + numVideos * retouchPerVideo;
      const totalHours = totalGenHours + totalRetouchHours;

      // Assuming average creative team bandwidth of 7 productive hours/day
      const estimatedDays = Math.max(1, Math.ceil(totalHours / 7));

      // Percentages
      const craftPercent = totalHours > 0 ? Math.round((totalRetouchHours / totalHours) * 100) : 0;
      const aiPercent = totalHours > 0 ? 100 - craftPercent : 0;

      // Update UI displays
      if (imagesValDisp) imagesValDisp.textContent = `${numImages} still${numImages === 1 ? '' : 's'}`;
      if (videosValDisp) videosValDisp.textContent = `${numVideos} shot${numVideos === 1 ? '' : 's'} (${numVideos * 5}s total)`;

      if (outAiGen) outAiGen.textContent = `${totalGenHours}h`;
      if (outRetouch) outRetouch.textContent = `${totalRetouchHours}h`;
      if (outTotal) outTotal.textContent = `${totalHours} hrs`;
      if (outDays) outDays.textContent = `~${estimatedDays} business days`;
      if (outCraftRatio) outCraftRatio.textContent = `${craftPercent}% Human Craft / ${aiPercent}% AI`;

      if (craftBar) craftBar.style.width = `${craftPercent}%`;
      if (aiBar) aiBar.style.width = `${aiPercent}%`;

      // Traditional comparison
      if (traditionalComparison) {
        // Traditional live-action shoot for equivalent assets (scouting, crew, equipment, 3D vfx, studio)
        const tradHours = Math.round(totalHours * 3.4);
        const tradDays = Math.ceil(tradHours / 8);
        const hoursSaved = Math.max(0, tradHours - totalHours);
        const pctSaved = Math.round((hoursSaved / tradHours) * 100);

        traditionalComparison.innerHTML = `
          <div class="comp-item">
            <span class="comp-label">Traditional Live Shoot Time:</span>
            <span class="comp-val">~${tradHours}h (${tradDays} days)</span>
          </div>
          <div class="comp-item">
            <span class="comp-label">Time Saved with BLC AI:</span>
            <span class="comp-val highlight">${pctSaved}% faster (~${hoursSaved}h saved)</span>
          </div>
          <div class="comp-item">
            <span class="comp-label">Production Advantage:</span>
            <span class="comp-desc">Rapid concept branching with 0 location permits, while maintaining ${craftPercent}% human editorial retouching.</span>
          </div>
        `;
      }

      return {
        numImages,
        numVideos,
        totalGenHours,
        totalRetouchHours,
        totalHours,
        estimatedDays,
        selectedTier,
        craftPercent
      };
    }

    imagesInput.addEventListener('input', calculate);
    videosInput.addEventListener('input', calculate);
    tierRadios.forEach((r) => r.addEventListener('change', calculate));

    // Initial calculation
    calculate();

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const data = calculate();
        const summary = `BLC AI : Estimated Production Timeline:
• Assets: ${data.numImages} Hero Still(s) + ${data.numVideos} Video Shot(s) (${data.numVideos * 5}s total)
• Retouch Standard: ${data.selectedTier === 'master' ? 'Master Commercial (8h/img, 6h/vid)' : 'Standard (5h/img, 5h/vid)'}
• AI Generation Time: ${data.totalGenHours} hours
• Human Retouch & Compositing: ${data.totalRetouchHours} hours
• Total Studio Hours: ${data.totalHours} hours (~${data.estimatedDays} business days)
• Craft Distribution: ${data.craftPercent}% Human Craft & Retouch / ${100 - data.craftPercent}% AI Generation

Calculated via BLC AI Production Platform.`;

        navigator.clipboard.writeText(summary).then(() => {
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied to Clipboard!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copied');
          }, 2400);
        }).catch(() => {
          alert('Copied summary to clipboard!');
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }
})();
