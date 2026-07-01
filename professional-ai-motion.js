/**
 * Professional AI Cinematic Motion Animation (Ultra-Premium / No-GSAP)
 * Design Architecture: Spatial Glassmorphism + Fluid Hardware Acceleration + Humanized Pacing
 * Cadence: 4.5 seconds per scene for maximum reading comprehension and visual breathing room.
 *
 * FIXES:
 * - Search placeholder is cleared immediately on scene transition, eliminating wrong prompts.
 * - Typing simulation starts only after the new scene is fully visible.
 * - All timers are meticulously cleared to prevent overlaps.
 */

(function() {
  'use strict';

  function checkPremium() {
    const p = (localStorage.getItem('_user_id') || 'anon') + '_';
    return localStorage.getItem(p + 'premium') === 'true' || 
           (typeof window !== 'undefined' && window.state && window.state.isPremium);
  }

  // Tracks the pending "waiting for #welcomeScreen" retry, so a fresh call
  // to init() (e.g. after login/logout) can cancel a stale one instead of
  // letting multiple retry chains run at once.
  let pendingRetryTimer = null;
  let retryAttempts = 0;
  const MAX_RETRY_ATTEMPTS = 50; // ~10s at 200ms — plenty for normal page load

  function init() {
    if (pendingRetryTimer) {
      clearTimeout(pendingRetryTimer);
      pendingRetryTimer = null;
    }

    if (checkPremium()) return;

    const welcomeScreen = document.getElementById('welcomeScreen');
    if (!welcomeScreen) {
      if (retryAttempts >= MAX_RETRY_ATTEMPTS) {
        retryAttempts = 0;
        return;
      }
      retryAttempts++;
      pendingRetryTimer = setTimeout(init, 200);
      return;
    }

    // ✅ Check if welcomeScreen is actually visible
    const isWelcomeVisible = welcomeScreen.style.display !== 'none' && 
                             welcomeScreen.style.visibility !== 'hidden' &&
                             welcomeScreen.offsetParent !== null;
    
    if (!isWelcomeVisible) {
      retryAttempts = 0;
      return; // Welcome screen not visible, don't show animation
    }

    // ✅ If animation already exists and welcome screen is visible, assume it's already initialized
    const existingWrapper = document.getElementById('ai-motion-wrapper');
    if (existingWrapper && existingWrapper.style.display !== 'none') {
      retryAttempts = 0;
      return; // Animation already showing
    }

    // If animation was hidden, show it again for new chat
    if (existingWrapper && existingWrapper.style.display === 'none') {
      existingWrapper.style.display = 'flex';
      existingWrapper.style.opacity = '1';
      existingWrapper.style.visibility = 'visible';
      existingWrapper.style.pointerEvents = 'auto';
      retryAttempts = 0;
      return; // Reuse existing animation
    }

    retryAttempts = 0;
    createPremiumVanillaAnimation(welcomeScreen);
  }

  function createPremiumVanillaAnimation(welcomeScreen) {
    // Reuse the stylesheet if it's already on the page (e.g. this is a
    // second run after the user skipped the animation once already) instead
    // of stacking duplicate <style> tags in <head>.
    const existingStyleEl = document.getElementById('premium-ai-vanilla-motion-styles');
    const styleEl = existingStyleEl || document.createElement('style');
    styleEl.id = 'premium-ai-vanilla-motion-styles';
    
    const fluidEase = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

    styleEl.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@300;400;500&family=Space+Grotesk:wght@500;700&display=swap');

      #welcomeScreen {
        padding: 0 !important; 
        margin: 0 !important;
        display: flex !important;
        flex-direction: column;
        width: 100%;
        flex: 1 !important;
        min-height: 0 !important;
        overflow: hidden !important;
        position: relative;
        z-index: 1;
        visibility: visible !important;
        opacity: 1 !important;
        background: transparent !important;
      }

      #ai-motion-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        flex: 1 !important;
        min-height: 0 !important;
        overflow: hidden !important; 
        padding: 0 !important; 
        margin: 0 !important;
        background: transparent !important; 
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box;
        font-family: 'Plus Jakarta Sans', sans-serif;
        visibility: visible !important;
        opacity: 1 !important;
        transition: opacity 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0.4s ease !important;
      }

      #ai-vfx-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        z-index: 1;
        opacity: 0.5;
        mix-blend-mode: screen;
        pointer-events: none;
      }

      #ai-ambient-glow {
        position: absolute;
        inset: 0;
        background: 
          radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.12) 0%, transparent 40%),
          radial-gradient(circle at 90% 90%, rgba(56, 189, 248, 0.10) 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.06) 0%, transparent 60%);
        z-index: 2;
        pointer-events: none;
        filter: blur(60px);
      }

      #ai-motion-hud {
        position: relative;
        width: 100%;
        max-width: 1200px;
        height: 100%;
        max-height: 100%;
        min-height: 100%;
        display: grid;
        grid-template-columns: 1.5fr 1fr;
        background: transparent;
        border: none !important;
        border-radius: 0;
        z-index: 10;
        overflow: hidden;
        box-shadow: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        padding: 10px 20px;
        gap: 0;
      }

      .ai-text-hub {
        padding: 20px 30px 20px 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        z-index: 5;
        overflow: hidden;
        height: 100%;
      }

      .ai-chip {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #a78bfa;
        background: rgba(167, 139, 250, 0.08);
        border: 1px solid rgba(167, 139, 250, 0.2);
        padding: 5px 12px;
        border-radius: 100px;
        margin-bottom: 8px;
        opacity: 0;
        transform: translate3d(0, -15px, 0);
        transition: opacity 0.8s ${fluidEase}, transform 0.8s ${fluidEase};
        white-space: nowrap;
        flex-shrink: 0;
        will-change: opacity, transform;
      }

      .ai-title-viewport {
        overflow: visible !important;
        margin-bottom: 4px;
        width: 100%;
        flex-shrink: 0;
      }

      .ai-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: clamp(24px, 3.2vw, 40px);
        font-weight: 700;
        color: #ffffff;
        line-height: 1.15;
        letter-spacing: -0.03em;
        margin: 0;
        opacity: 0;
        transform: translate3d(0, 30px, 0) rotate(1deg);
        transform-origin: left bottom;
        transition: opacity 0.9s ${fluidEase}, transform 0.9s ${fluidEase};
        max-height: 5rem;
        overflow: hidden;
        will-change: opacity, transform;
      }

      .ai-highlight {
        background: linear-gradient(135deg, #e879f9 0%, #c084fc 50%, #818cf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        display: inline-block;
      }

      .ai-desc {
        font-size: clamp(12px, 1.1vw, 15px);
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.55);
        margin: 0 0 12px 0;
        font-weight: 300;
        max-width: 480px;
        opacity: 0;
        transform: translate3d(0, 20px, 0);
        transition: opacity 0.9s ${fluidEase}, transform 0.9s ${fluidEase};
        flex-shrink: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 2.8rem;
        will-change: opacity, transform;
      }

      .ai-search-container {
        width: 100%;
        max-width: 420px;
        position: relative;
        opacity: 0;
        transform: translate3d(0, 20px, 0);
        transition: opacity 0.9s ${fluidEase}, transform 0.9s ${fluidEase};
        flex-shrink: 0;
        margin-top: 2px;
        will-change: opacity, transform;
      }

      .ai-search-bar {
        width: 100%;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 11px 14px 11px 40px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        min-height: 44px;
        overflow: visible;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        flex-wrap: nowrap;
      }

      .ai-search-bar,
      .ai-search-placeholder {
        color: rgba(255, 255, 255, 0.9) !important;
      }

      [data-theme="light"] .ai-search-bar,
      [data-theme="light"] .ai-search-placeholder {
        color: #1a1a2e !important;
      }

      [data-theme="light"] .ai-search-bar {
        background: rgba(0, 0, 0, 0.05) !important;
        border-color: rgba(0, 0, 0, 0.1) !important;
      }

      [data-theme="light"] .ai-search-icon {
        color: #6C63FF !important;
      }

      [data-theme="light"] .ai-cursor {
        background-color: #6C63FF !important;
      }

      [data-theme="light"] .ai-title {
        color: #1a1a2e !important;
      }

      [data-theme="light"] .ai-desc {
        color: rgba(26, 26, 46, 0.65) !important;
      }

      [data-theme="light"] .ai-chip {
        color: #6C63FF !important;
        background: rgba(108, 99, 255, 0.08) !important;
        border-color: rgba(108, 99, 255, 0.2) !important;
      }

      [data-theme="light"] .ai-highlight {
        background: linear-gradient(135deg, #6C63FF 0%, #a78bfa 50%, #8b5cf6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      [data-theme="light"] .inner-glow-core {
        background: linear-gradient(135deg, rgba(108, 99, 255, 0.8), rgba(139, 92, 246, 0.8)) !important;
      }

      [data-theme="light"] .premium-orbit-node {
        background: radial-gradient(circle, rgba(108, 99, 255, 0.06) 0%, transparent 60%) !important;
        border-color: rgba(108, 99, 255, 0.1) !important;
      }

      [data-theme="light"] .premium-orbit-node::before {
        border-color: rgba(108, 99, 255, 0.1) !important;
      }

      [data-theme="light"] .ai-skip-cta {
        color: rgba(26, 26, 46, 0.5) !important;
        border-color: rgba(0, 0, 0, 0.08) !important;
        background: rgba(255, 255, 255, 0.5) !important;
      }

      [data-theme="light"] .ai-skip-cta:hover {
        color: #1a1a2e !important;
        background: rgba(255, 255, 255, 0.8) !important;
        border-color: rgba(0, 0, 0, 0.15) !important;
      }

      .ai-search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #c084fc;
        font-size: 15px;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .ai-search-placeholder {
        white-space: normal;
        overflow: visible;
        display: inline-block;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 400;
        letter-spacing: -0.01em;
        flex: 1;
        min-width: 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.4;
        word-break: break-word;
        max-width: 100%;
        /* ✅ GPU Acceleration - prevents flickering */
        transform: translateZ(0);
        backface-visibility: hidden;
        /* ✅ Optimize for text changes */
        contain: content;
        /* ✅ Smooth text rendering */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .ai-cursor {
        display: inline-block;
        width: 2px;
        height: 16px;
        background-color: #c084fc;
        margin-left: 2px;
        vertical-align: middle;
        animation: blink 1s step-end infinite;
        flex-shrink: 0;
        /* ✅ GPU Acceleration - smooth cursor animation */
        transform: translateZ(0);
        backface-visibility: hidden;
        will-change: opacity;
      }

      @keyframes blink { 
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }

      .active-frame .ai-chip { opacity: 1; transform: translate3d(0, 0, 0); transition-delay: 0.1s; }
      .active-frame .ai-title { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); transition-delay: 0.2s; }
      .active-frame .ai-desc { opacity: 1; transform: translate3d(0, 0, 0); transition-delay: 0.35s; }
      .active-frame .ai-search-container { opacity: 1; transform: translate3d(0, 0, 0); transition-delay: 0.5s; }

      .ai-graphic-stage {
        position: relative;
        background: radial-gradient(circle at center, rgba(255,255,255,0.015) 0%, transparent 70%);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        min-height: 0;
        height: 100%;
      }

      .graphic-viewport {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: scale(0.95) translate3d(20px, 0, 0);
        transition: opacity 1.2s ${fluidEase}, transform 1.2s ${fluidEase};
        pointer-events: none;
      }

      .graphic-viewport.active {
        opacity: 1;
        transform: scale(1) translate3d(0, 0, 0);
        pointer-events: auto;
      }

      .premium-orbit-node {
        width: clamp(140px, 18vw, 220px);
        height: clamp(140px, 18vw, 220px);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 60%);
        border: 1px solid rgba(167, 139, 250, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: spinClockwise 45s linear infinite;
        position: relative;
      }

      .premium-orbit-node::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 1px dashed rgba(56, 189, 248, 0.08);
        animation: spinCounter 35s linear infinite;
      }

      .inner-glow-core {
        width: clamp(60px, 8vw, 100px);
        height: clamp(60px, 8vw, 100px);
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.7), rgba(236, 72, 153, 0.7));
        box-shadow: 0 0 30px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(255,255,255,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: clamp(28px, 4vw, 48px);
        color: white;
        animation: breathPulse 4s ease-in-out infinite alternate;
        backdrop-filter: blur(10px);
      }

      @keyframes spinClockwise { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes spinCounter { 0% { transform: rotate(360deg) scale(1.1); } 100% { transform: rotate(0deg) scale(1.1); } }
      @keyframes breathPulse { 
        0% { transform: scale(0.95); box-shadow: 0 0 30px rgba(139, 92, 246, 0.3); } 
        100% { transform: scale(1.05); box-shadow: 0 0 50px rgba(236, 72, 153, 0.4); } 
      }

      .ai-skip-cta {
        position: absolute;
        bottom: 20px;
        right: 24px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 12px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 8px 18px;
        border-radius: 100px;
        cursor: pointer;
        z-index: 50;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      .ai-skip-cta:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
      }

      @media (max-width: 900px) {
        #ai-motion-hud {
          grid-template-columns: 1fr;
          grid-template-rows: 1.2fr 0.8fr;
          padding: 8px 12px;
          gap: 0;
          height: 100%;
          min-height: 100%;
        }
        
        .ai-text-hub {
          padding: 14px 16px 6px 16px;
          justify-content: center;
          gap: 2px;
          height: auto;
          min-height: 0;
        }
        
        .ai-graphic-stage {
          min-height: 0;
          height: auto;
          border-top: none;
        }

        .ai-title {
          font-size: clamp(20px, 4vw, 28px);
          max-height: 3.6rem;
        }
        
        .ai-desc {
          font-size: clamp(11px, 1.6vw, 13px);
          margin-bottom: 8px;
          min-height: 2.2rem;
          -webkit-line-clamp: 2;
        }

        .premium-orbit-node {
          width: clamp(100px, 20vw, 150px);
          height: clamp(100px, 20vw, 150px);
        }
        
        .inner-glow-core {
          width: clamp(48px, 10vw, 70px);
          height: clamp(48px, 10vw, 70px);
          font-size: clamp(20px, 4vw, 32px);
        }

        .ai-skip-cta {
          bottom: 12px;
          right: 14px;
          padding: 5px 12px;
          font-size: 10px;
        }

        .ai-search-container {
          max-width: 100%;
        }
      }

      @media (max-width: 600px) {
        #ai-motion-hud {
          padding: 4px 8px;
          grid-template-rows: 1.1fr 0.9fr;
        }
        .ai-text-hub { padding: 10px 12px 4px 12px; }
        .ai-title { font-size: clamp(16px, 3.6vw, 22px); max-height: 2.8rem; }
        .ai-desc { font-size: clamp(10px, 1.4vw, 12px); min-height: 1.8rem; margin-bottom: 4px; -webkit-line-clamp: 2; }
        .ai-search-bar { padding: 8px 10px 8px 32px; font-size: 12px; min-height: 36px; border-radius: 10px; }
        .ai-search-icon { left: 10px; font-size: 13px; }
        .ai-chip { font-size: 8px; padding: 3px 8px; margin-bottom: 4px; }
        .premium-orbit-node { width: clamp(70px, 18vw, 100px); height: clamp(70px, 18vw, 100px); }
        .inner-glow-core { width: clamp(36px, 9vw, 52px); height: clamp(36px, 9vw, 52px); font-size: clamp(16px, 3.5vw, 24px); }
        .ai-skip-cta { bottom: 8px; right: 10px; padding: 4px 10px; font-size: 9px; }
        .ai-search-placeholder { font-size: 12px; }
      }

      @media (max-width: 400px) {
        #ai-motion-hud { padding: 2px 4px; }
        .ai-title { font-size: clamp(14px, 3vw, 18px); max-height: 2.4rem; }
        .ai-desc { font-size: clamp(9px, 1.2vw, 11px); min-height: 1.4rem; }
        .ai-search-bar { font-size: 11px; min-height: 32px; padding: 6px 8px 6px 28px; }
        .premium-orbit-node { width: clamp(55px, 15vw, 75px); height: clamp(55px, 15vw, 75px); }
        .inner-glow-core { width: clamp(28px, 7vw, 38px); height: clamp(28px, 7vw, 38px); font-size: clamp(12px, 3vw, 18px); }
        .ai-chip { font-size: 7px; padding: 2px 6px; }
        .ai-skip-cta { display: none; }
        .ai-search-placeholder { font-size: 10px; }
      }

      @media (max-height: 500px) and (orientation: landscape) {
        #ai-motion-hud {
          grid-template-columns: 1.2fr 1fr;
          grid-template-rows: 1fr;
          padding: 4px 10px;
        }
        .ai-text-hub { padding: 6px 12px 4px 12px; }
        .ai-title { font-size: clamp(14px, 2.5vw, 20px); max-height: 2.2rem; }
        .ai-desc { font-size: clamp(9px, 1.2vw, 11px); min-height: 1.2rem; margin-bottom: 2px; -webkit-line-clamp: 1; }
        .ai-search-bar { padding: 5px 8px 5px 26px; font-size: 10px; min-height: 28px; }
        .ai-search-icon { left: 8px; font-size: 11px; }
        .ai-chip { font-size: 7px; padding: 2px 6px; margin-bottom: 2px; }
        .premium-orbit-node { width: clamp(50px, 12vw, 80px); height: clamp(50px, 12vw, 80px); }
        .inner-glow-core { width: clamp(26px, 6vw, 40px); height: clamp(26px, 6vw, 40px); font-size: clamp(12px, 2.5vw, 18px); }
        .ai-skip-cta { display: none; }
        .ai-search-placeholder { font-size: 9px; }
      }

      #welcomeScreen {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        min-height: 200px !important;
        flex: 1 1 0% !important;
      }

      #ai-motion-wrapper {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
        flex: 1 1 0% !important;
        min-height: 0 !important;
      }

      #ai-motion-hud {
        display: grid !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

      .welcome-icon, .welcome-screen h2, .welcome-screen p, .feature-pills, .welcome-chips {
        display: none !important;
      }

      .messages-container {
        flex: 1 1 0% !important;
        min-height: 0 !important;
        display: flex !important;
        flex-direction: column !important;
      }

      .messages {
        flex: 1 1 0% !important;
        min-height: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        padding: 0 !important;
        max-width: 100% !important;
      }

      #welcomeScreen {
        flex: 1 1 0% !important;
        min-height: 0 !important;
        height: 100% !important;
      }
    `;
    if (!existingStyleEl) document.head.appendChild(styleEl);

    const wrapper = document.createElement('div');
    wrapper.id = 'ai-motion-wrapper';

    const canvas = document.createElement('canvas');
    canvas.id = 'ai-vfx-canvas';

    const ambientGlow = document.createElement('div');
    ambientGlow.id = 'ai-ambient-glow';

    const hud = document.createElement('div');
    hud.id = 'ai-motion-hud';
    hud.className = 'active-frame';

    const textHub = document.createElement('div');
    textHub.className = 'ai-text-hub';

    const chip = document.createElement('div');
    chip.className = 'ai-chip';

    const titleViewport = document.createElement('div');
    titleViewport.className = 'ai-title-viewport';
    const title = document.createElement('h1');
    title.className = 'ai-title';
    titleViewport.appendChild(title);

    const desc = document.createElement('p');
    desc.className = 'ai-desc';

    const searchContainer = document.createElement('div');
    searchContainer.className = 'ai-search-container';
    searchContainer.innerHTML = `
      <div class="ai-search-bar">
        <span class="ai-search-icon">✦</span>
        <span class="ai-search-placeholder" id="ai-typing-input-field"></span>
        <span class="ai-cursor"></span>
      </div>
    `;

    textHub.appendChild(chip);
    textHub.appendChild(titleViewport);
    textHub.appendChild(desc);
    textHub.appendChild(searchContainer);

    const graphicStage = document.createElement('div');
    graphicStage.className = 'ai-graphic-stage';

    const skipBtn = document.createElement('button');
    skipBtn.className = 'ai-skip-cta';
    skipBtn.textContent = 'Enter Workspace';

    hud.appendChild(textHub);
    hud.appendChild(graphicStage);
    wrapper.appendChild(canvas);
    wrapper.appendChild(ambientGlow);
    wrapper.appendChild(hud);
    wrapper.appendChild(skipBtn);

    welcomeScreen.innerHTML = '';
    welcomeScreen.appendChild(wrapper);

    const features = [
      { chip: 'Core Engine', title: 'Immersive <span class="ai-highlight">AI Chat</span> Insights', desc: 'Engage with natural-flowing pedagogical models mapped directly to your exact educational curriculum and real-time learning pace.', searchPrompt: 'Explain quantum simply', icon: '💬' },
      { chip: 'Professional AI', title: 'Resolve Doubts with <span class="ai-highlight">Absolute Precision</span>', desc: 'Unleash structured context-aware breakdowns and multi-layered thematic analytics anytime, anywhere, 24/7.', searchPrompt: 'Tell me about CGL', icon: '🧠' },
      { chip: 'Global Arena', title: 'Dominate in <span class="ai-highlight">Live Battles</span>', desc: 'Enter synchronous high-intensity coding arenas against peers worldwide to climb the ranks and claim absolute dominance.', searchPrompt: 'matchmaking server Battles', icon: '⚡' },
      { chip: 'Predictive Models', title: 'Calibrate with <span class="ai-highlight">Adaptive Mocks</span>', desc: 'Refine your strategy under hyper-realistic runtime conditions driven by analytical models targeting your absolute weaknesses.', searchPrompt: 'SSC CGL mock test', icon: '🎯' }
    ];

    features.forEach((feat, idx) => {
      const view = document.createElement('div');
      view.className = `graphic-viewport graphic-viewport-${idx}`;
      if (idx === 0) view.classList.add('active');

      const orbitNode = document.createElement('div');
      orbitNode.className = 'premium-orbit-node';
      const core = document.createElement('div');
      core.className = 'inner-glow-core';
      core.innerHTML = feat.icon;

      orbitNode.appendChild(core);
      view.appendChild(orbitNode);
      graphicStage.appendChild(view);
    });

    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let gridParticles = [];

    window.addEventListener('resize', () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });

    class GridNode {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.radius = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.15; 
        this.speedY = (Math.random() - 0.5) * 0.15;
        this.opacity = Math.random() * 0.3 + 0.05;
        this.color = ['#c084fc', '#38bdf8', '#818cf8'][Math.floor(Math.random() * 3)];
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
      }
    }

    for (let i = 0; i < 40; i++) gridParticles.push(new GridNode()); 

    function backdropRenderPipeline() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255,255,255,0.006)'; 
      ctx.lineWidth = 1;
      const steps = 100;
      for (let x = 0; x < W; x += steps) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += steps) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      gridParticles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(backdropRenderPipeline);
    }
    backdropRenderPipeline();

    // --- GLOBALS FOR TIMER MANAGEMENT ---
    let activeIndex = 0;
    let typeInterval = null;
    let frameTimeout = null;
    let typingStartTimeout = null;
    let sceneLoopInterval = null;

    // --- TYPING SIMULATION WITH ADAPTIVE SPEED ---
    function runTypingSimulation(textString, targetSelectorElement, duration = 1400) {
      // Clear any existing animation
      if (typeInterval !== null) {
        cancelAnimationFrame(typeInterval);
        typeInterval = null;
      }
      
      const totalChars = textString.length;
      if (totalChars === 0) {
        targetSelectorElement.textContent = '';
        return;
      }
      
      // Set initial state
      targetSelectorElement.textContent = '';
      targetSelectorElement.style.willChange = 'contents';
      
      let startTime = null;
      let lastCharIdx = -1;
      
      // Use requestAnimationFrame for smooth, non-blocking animation
      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Calculate which character to show (0 to totalChars)
        const charIdx = Math.floor(progress * totalChars);
        
        // Only update DOM when character index changes (prevents excessive reflows)
        if (charIdx !== lastCharIdx && charIdx <= totalChars) {
          lastCharIdx = charIdx;
          // Build text string up to current character
          targetSelectorElement.textContent = textString.substring(0, charIdx);
        }
        
        // Continue animation until complete
        if (progress < 1) {
          typeInterval = requestAnimationFrame(animate);
        } else {
          // Animation complete
          targetSelectorElement.textContent = textString;
          targetSelectorElement.style.willChange = 'auto';
          typeInterval = null;
        }
      };
      
      typeInterval = requestAnimationFrame(animate);
    }

    // --- RENDER A FEATURE FRAME (CLEAR PLACEHOLDER IMMEDIATELY) ---
    function renderActiveFeatureFrame(index) {
      const targetFeature = features[index];
      const placeholderField = document.getElementById('ai-typing-input-field');

      // Clear all pending timers from the previous scene
      if (frameTimeout) clearTimeout(frameTimeout);
      if (typingStartTimeout) clearTimeout(typingStartTimeout);
      // ✅ Use cancelAnimationFrame since we switched to requestAnimationFrame
      if (typeInterval !== null) {
        cancelAnimationFrame(typeInterval);
      }
      frameTimeout = null;
      typingStartTimeout = null;
      typeInterval = null;

      // Immediately clear the search placeholder to prevent old prompt from lingering
      if (placeholderField) placeholderField.textContent = '';

      // Start fade-out: remove active class so all text/graphics fade out
      hud.classList.remove('active-frame');
      
      // Switch graphic viewport immediately (it has its own transition)
      document.querySelectorAll('.graphic-viewport').forEach((v, i) => {
        v.classList.toggle('active', i === index);
      });

      // After fade-out (0.9s), replace content and fade in
      frameTimeout = setTimeout(() => {
        // Set new content (chip, title, description)
        chip.textContent = targetFeature.chip;
        title.innerHTML = targetFeature.title;
        desc.textContent = targetFeature.desc;
        
        // Ensure placeholder is still empty (it already is)
        if (placeholderField) {
          placeholderField.textContent = '';
        }

        // Force reflow to ensure transitions apply
        void hud.offsetWidth;

        // Fade in with new content
        hud.classList.add('active-frame');

        // Start typing simulation after the search container begins to appear.
        // The container has a 0.5s delay + 0.9s duration, so we start after 0.3s
        // and set duration to 1.2s to finish before the container is fully opaque.
        if (placeholderField) {
          typingStartTimeout = setTimeout(() => {
            runTypingSimulation(targetFeature.searchPrompt, placeholderField, 1200);
          }, 300);
        }
      }, 900); // matches the longest text transition (0.9s)
    }

    // --- INITIAL SCENE ---
    renderActiveFeatureFrame(activeIndex);

    // --- AUTO-ROTATE SCENES ---
    sceneLoopInterval = setInterval(() => {
      activeIndex = (activeIndex + 1) % features.length;
      renderActiveFeatureFrame(activeIndex);
    }, 5500);

    // --- SKIP / EXIT ---
    function terminateIntroCanvasLayer() {
      if (sceneLoopInterval) clearInterval(sceneLoopInterval);
      // ✅ Use cancelAnimationFrame for typeInterval
      if (typeInterval !== null) cancelAnimationFrame(typeInterval);
      if (frameTimeout) clearTimeout(frameTimeout);
      if (typingStartTimeout) clearTimeout(typingStartTimeout);
      
      wrapper.style.transition = 'opacity 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      wrapper.style.opacity = '0';
      wrapper.style.visibility = 'hidden !important';
      wrapper.style.pointerEvents = 'none !important';
      wrapper.style.display = 'none'; // ✅ Add display:none so init() can detect hidden state
      setTimeout(() => {
        welcomeScreen.style.display = 'none !important';
        welcomeScreen.innerHTML = '';
        if (typeof window.onIntroComplete === 'function') window.onIntroComplete();
      }, 500);
    }

    skipBtn.addEventListener('click', terminateIntroCanvasLayer);
    
    // ✅ NEW: Expose function globally so app.js can call it when user sends message
    window.hideMotionAnimation = terminateIntroCanvasLayer;
  }

  // --- BOOT ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.initProfessionalAIMotion = init;
})();
