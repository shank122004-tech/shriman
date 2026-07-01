/**
 * strict-gate-patch.js — CrackAI Hard Paywall v2.1 (FIXED)
 * ✅ FIXED: Premium users CAN now chat
 * 0 free chats (all models require premium)
 * 3 FREE mock tests/day, 3 FREE battles/day for all users (tracked on actual start)
 * NO free chat messaging in sidebar
 * Group creation restricted to Premium users
 */
(function () {
  'use strict';

  var FREE_TEXT  = 0;
  var FREE_IMAGE = 0;
  var FREE_PDF   = 0;
  var FREE_BATTLES = 3;
  var FREE_MOCK_TESTS = 3;

  /* ── Robust premium verification ─────────────────────────── */
  window._premiumStatusMap = {};
  
  window.getPremiumStatus = async function(uid) {
    if (!uid) return false;
    
    // Check cache first (valid for 5 minutes)
    const cached = window._premiumStatusMap[uid];
    if (cached && (Date.now() - cached.time) < 300000) {
      return cached.status;
    }
    
    // Check Firestore first (source of truth)
    try {
      const db = window._firebaseDb;
      const { doc, getDoc } = window._firebaseFns || {};
      if (db && getDoc) {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const data = snap.data();
          const isPrem = data.isPremium || data.premium || false;
          window._premiumStatusMap[uid] = { status: isPrem, time: Date.now() };
          localStorage.setItem('sscai_u:' + uid + ':premium', isPrem ? 'true' : 'false');
          return isPrem;
        }
      }
    } catch(e) {
      console.error('[Premium] Firestore check error:', e);
    }
    
    // Fallback to localStorage
    const localStatus = localStorage.getItem('sscai_u:' + uid + ':premium') === 'true';
    window._premiumStatusMap[uid] = { status: localStatus, time: Date.now() };
    return localStatus;
  };

  /* ── Sync premium status from Firestore on login ──────────── */
  window.syncPremiumStatus = async function(uid) {
    if (!uid) return;
    const db = window._firebaseDb;
    const { doc, getDoc } = window._firebaseFns || {};
    if (!db || !getDoc) return;
    
    try {
      // Clear cache to force fresh fetch
      window._premiumStatusMap[uid] = null;
      
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        const isPrem = data.isPremium || data.premium || false;
        localStorage.setItem('sscai_u:' + uid + ':premium', isPrem ? 'true' : 'false');
        
        // Also sync the premium plan
        if (data.premiumPlan) {
          localStorage.setItem('sscai_u:' + uid + ':premium_plan', data.premiumPlan);
        }
        
        window._premiumStatusMap[uid] = { status: isPrem, time: Date.now() };
        
        if (typeof state !== 'undefined') {
          state.isPremium = isPrem;
          if (isPrem) state.premiumPlan = data.premiumPlan || 'premium';
        }
        
        if (isPrem) {
          console.info('[StrictGate] Premium status confirmed from Firestore');
        }
      }
    } catch(e) {
      console.error('[Premium] Sync error:', e);
    }
  };

  /* ── Open premium modal safely ────────────────────────────── */
  function openPremium() {
    try {
      if (typeof openPremiumModal === 'function') { openPremiumModal(); return; }
      if (typeof window.showPremiumModal === 'function') { window.showPremiumModal(); return; }
      var m = document.getElementById('premiumModal');
      if (m) m.classList.add('active');
    } catch (e) {}
  }

  /* ── Disable reward / ad bypass ──────────────────────────── */
  window.isRewardActive      = function () { return false; };
  window.rewardRemainingMs   = function () { return 0; };
  window.rewardRemainingLabel= function () { return '0:00'; };
  window.showRewardPopup     = function () { openPremium(); };
  window.activateReward      = function () {};

  /* ── FIX: canSend* functions - Check Premium Status ──────── */
  /* ✅ FIXED: Now checks if user is premium before blocking */
  function canText()  { 
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    if (!uid) return false; // Not logged in
    const isPrem = localStorage.getItem('sscai_u:' + uid + ':premium') === 'true';
    return isPrem; // Allow if premium, block if not
  }
  
  function canImage() { 
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    if (!uid) return false; // Not logged in
    const isPrem = localStorage.getItem('sscai_u:' + uid + ':premium') === 'true';
    return isPrem; // Allow if premium, block if not
  }
  
  function canPdf()   { 
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    if (!uid) return false; // Not logged in
    const isPrem = localStorage.getItem('sscai_u:' + uid + ':premium') === 'true';
    return isPrem; // Allow if premium, block if not
  }

  window.canSendText  = canText;
  window.canSendImage = canImage;
  window.canSendPdf   = canPdf;

  /* ── handleLimitHit ──────────────────────────────────────── */
  window.handleLimitHit = function (type) {
    var labels = { text: '🔒 All AI chats require Premium', image: '🔒 All models require Premium', pdf: '🔒 All models require Premium' };
    try { if (typeof showToast === 'function') showToast((labels[type] || 'Upgrade Required') + ' — Start from ₹129/month'); } catch(e){}
    openPremium();
  };

  /* ── Mock Test limit (3 per day FREE) - Only track on actual start, use Firestore for persistence ────────────────────── */
  window.getMockTestUsageToday = async function() {
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    if (!uid) return 0;
    
    // First check Firestore for source of truth
    try {
      const db = window._firebaseDb;
      const { doc, getDoc } = window._firebaseFns || {};
      if (db && getDoc) {
        const today = new Date().toISOString().split('T')[0];
        const snap = await getDoc(doc(db, 'users', uid, 'dailyUsage', today));
        if (snap.exists()) {
          return snap.data().mockTests || 0;
        }
      }
    } catch(e) {}
    
    // Fallback to localStorage
    const today = new Date().toISOString().split('T')[0];
    const key = 'sscai_mock_' + today + '_' + uid;
    return parseInt(localStorage.getItem(key) || '0');
  };

  window.checkMockTestAccess = async function() {
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    
    if (!uid) {
      return { allowed: false, reason: '🔒 Please login first to access Mock Tests' };
    }
    
    const isPrem = await window.getPremiumStatus(uid);
    
    if (isPrem) {
      return { allowed: true, reason: 'Premium user - unlimited mock tests', unlimited: true };
    }
    
    // FREE USERS: 3 per day
    const today = new Date().toISOString().split('T')[0];
    const count = await window.getMockTestUsageToday();
    const remaining = Math.max(0, FREE_MOCK_TESTS - count);
    
    if (count >= FREE_MOCK_TESTS) {
      return { 
        allowed: false, 
        reason: '🔒 Daily mock test limit reached (3/day free). Upgrade to Premium for unlimited.', 
        limit: 3, 
        used: count,
        remaining: 0
      };
    }
    
    return { allowed: true, used: count, limit: 3, remaining: remaining };
  };

  /* ── Track mock test usage - Called ONLY when test actually starts, persists in Firestore ──────────────────────────– */
  window.trackMockTestUsage = async function() {
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    if (!uid) return;
    
    const isPrem = await window.getPremiumStatus(uid);
    if (!isPrem) {
      const today = new Date().toISOString().split('T')[0];
      
      // Try to save to Firestore first (source of truth)
      try {
        const db = window._firebaseDb;
        const { doc, setDoc } = window._firebaseFns || {};
        if (db && setDoc) {
          const docRef = doc(db, 'users', uid, 'dailyUsage', today);
          const currentCount = await window.getMockTestUsageToday();
          const newCount = currentCount + 1;
          await setDoc(docRef, { mockTests: newCount, timestamp: new Date() }, { merge: true });
          const remaining = Math.max(0, FREE_MOCK_TESTS - newCount);
          try { if (typeof showToast === 'function') showToast(`📝 Mock Test Started · Used 1/3 · ${remaining} remaining today`); } catch(e){}
          return;
        }
      } catch(e) {}
      
      // Fallback to localStorage
      const key = 'sscai_mock_' + today + '_' + uid;
      const currentCount = parseInt(localStorage.getItem(key) || '0');
      const newCount = currentCount + 1;
      localStorage.setItem(key, newCount.toString());
      const remaining = Math.max(0, FREE_MOCK_TESTS - newCount);
      try { if (typeof showToast === 'function') showToast(`📝 Mock Test Started · Used ${newCount}/3 · ${remaining} remaining today`); } catch(e){}
    }
  };

  window.checkBattleAccess = async function() {
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    
    if (!uid) {
      return { allowed: false, reason: '🔒 Please login first to access Battles' };
    }
    
    const isPrem = await window.getPremiumStatus(uid);
    
    // Premium users: unlimited battles
    if (isPrem) {
      return { allowed: true, reason: 'Premium user - unlimited battles', unlimited: true };
    }
    
    // Free users: 3 per day
    const today = new Date().toISOString().split('T')[0];
    let count = 0;
    
    // Try Firestore first
    try {
      const db = window._firebaseDb;
      const { doc, getDoc } = window._firebaseFns || {};
      if (db && getDoc) {
        const snap = await getDoc(doc(db, 'users', uid, 'dailyUsage', today));
        if (snap.exists()) {
          count = snap.data().battles || 0;
        }
      }
    } catch(e) {}
    
    if (count === 0) {
      // Fallback to localStorage
      const key = 'sscai_battles_' + today + '_' + uid;
      count = parseInt(localStorage.getItem(key) || '0');
    }
    
    const remaining = Math.max(0, FREE_BATTLES - count);
    
    if (count >= FREE_BATTLES) {
      return { 
        allowed: false, 
        reason: '🔒 Daily battle limit reached (3/day free). Upgrade to Premium for unlimited.', 
        limit: 3, 
        used: count,
        remaining: 0
      };
    }
    
    return { allowed: true, used: count, limit: 3, remaining: remaining };
  };

  window.trackBattleUsage = async function() {
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    if (!uid) return;
    
    const isPrem = await window.getPremiumStatus(uid);
    if (!isPrem) {
      const today = new Date().toISOString().split('T')[0];
      
      try {
        const db = window._firebaseDb;
        const { doc, setDoc } = window._firebaseFns || {};
        if (db && setDoc) {
          const docRef = doc(db, 'users', uid, 'dailyUsage', today);
          const access = await window.checkBattleAccess();
          const newCount = (access.used || 0) + 1;
          await setDoc(docRef, { battles: newCount, timestamp: new Date() }, { merge: true });
          const remaining = Math.max(0, FREE_BATTLES - newCount);
          try { if (typeof showToast === 'function') showToast(`⚔️ Battle Created · Used ${newCount}/3 · ${remaining} remaining today`); } catch(e){}
          return;
        }
      } catch(e) {}
      
      // Fallback to localStorage
      const key = 'sscai_battles_' + today + '_' + uid;
      const currentCount = parseInt(localStorage.getItem(key) || '0');
      const newCount = currentCount + 1;
      localStorage.setItem(key, newCount.toString());
      const remaining = Math.max(0, FREE_BATTLES - newCount);
      try { if (typeof showToast === 'function') showToast(`⚔️ Battle Created · Used ${newCount}/3 · ${remaining} remaining today`); } catch(e){}
    }
  };

  /* ── Hide group creation for non-premium ──────────────────── */
  window.checkGroupCreationAccess = async function() {
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    
    if (!uid) {
      return { allowed: false, reason: '🔒 Please login first' };
    }
    
    const isPrem = await window.getPremiumStatus(uid);
    if (!isPrem) {
      return { allowed: false, reason: '🔒 Group creation is a Premium feature' };
    }
    
    return { allowed: true };
  };

  window.patchGroupCreationGate = function() {
    const createGroupBtn = document.getElementById('createGroupBtn') || 
                           document.querySelector('[data-action="create-group"]') ||
                           document.querySelector('button[onclick*="createGroup"]');
    
    if (!createGroupBtn || createGroupBtn._groupGateBound) return;
    createGroupBtn._groupGateBound = true;
    
    createGroupBtn.addEventListener('click', async function(e) {
      const access = await window.checkGroupCreationAccess();
      if (!access.allowed) {
        e.preventDefault();
        e.stopImmediatePropagation();
        try { if (typeof showToast === 'function') showToast(access.reason); } catch(ex){}
        openPremium();
        return false;
      }
    }, true);
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.patchGroupCreationGate);
  } else {
    window.patchGroupCreationGate();
  }
  setTimeout(window.patchGroupCreationGate, 800);
  setTimeout(window.patchGroupCreationGate, 2500);

  /* ── Vision/Pro/Teacher Model gates ──────────────────────── */
  window.checkPersonaAccess = async function(persona) {
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    
    const premiumPersonas = ['vision', 'vision-pro', 'v4-pro', 'pro', 'teacher'];
    
    if (premiumPersonas.includes(persona)) {
      if (!uid) {
        return { allowed: false, reason: '🔒 Please login first to access this model' };
      }
      
      const isPrem = await window.getPremiumStatus(uid);
      if (!isPrem) {
        return { allowed: false, reason: '🔒 This model requires Premium' };
      }
    }
    
    return { allowed: true };
  };

  window.patchPersonaGates = function() {
    document.querySelectorAll('[data-persona]').forEach(function(card) {
      if (card._personaGateBound) return;
      card._personaGateBound = true;
      
      const originalOnClick = card.onclick;
      const persona = card.getAttribute('data-persona');
      
      card.addEventListener('click', async function(e) {
        const access = await window.checkPersonaAccess(persona);
        if (!access.allowed) {
          e.preventDefault();
          e.stopImmediatePropagation();
          try { if (typeof showToast === 'function') showToast(access.reason); } catch(ex){}
          openPremium();
          return false;
        }
        
        if (originalOnClick) originalOnClick.call(card);
      }, true);
    });
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.patchPersonaGates);
  } else {
    window.patchPersonaGates();
  }
  setTimeout(window.patchPersonaGates, 800);
  setTimeout(window.patchPersonaGates, 2500);

  /* ── Patch persona selector dropdown ──────────────────────– */
  window.patchPersonaDropdown = function() {
    const personaOpts = document.querySelectorAll('select[name="persona"], #personaSelect, [data-persona-select] option, .persona-option');
    if (!personaOpts || personaOpts.length === 0) return;
    
    // Mark as patched to avoid duplicate bindings
    if (window._personaDropdownPatched) return;
    window._personaDropdownPatched = true;
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.patchPersonaDropdown);
  } else {
    window.patchPersonaDropdown();
  }
  setTimeout(window.patchPersonaDropdown, 800);
  setTimeout(window.patchPersonaDropdown, 2500);

  /* ── Teacher mode: Free unless overridden by other patches ─ */
  function restoreTeacherGate() {
    try {
      window.__teacherAlwaysFree = false;
      const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
      const isPrem = uid ? (localStorage.getItem('sscai_u:' + uid + ':premium') === 'true') : false;
      if (!isPrem) localStorage.removeItem('sscai_teacher_unlocked');
      window.openTeacherPaywall = function () {
        try { if (typeof showToast === 'function') showToast('🔒 Teacher Mode requires Premium'); } catch(ex){}
        openPremium();
      };
    } catch(e) {}
  }
  restoreTeacherGate();
  setTimeout(restoreTeacherGate, 500);
  setTimeout(restoreTeacherGate, 2500);
  window.addEventListener('load', restoreTeacherGate);

  /* ── Upload button gates ─────────────────────────────────── */
  function patchUploadBtns() {
    function gateBtn(id, limitFn, type) {
      var btn = document.getElementById(id);
      if (!btn || btn._sgBound) return;
      btn._sgBound = true;
      btn.addEventListener('click', function (e) {
        if (!limitFn()) {
          e.stopImmediatePropagation();
          try {
            var sub  = document.getElementById('uploadSubMenu');
            var wrap = document.getElementById('uploadBtnWrap');
            if (sub)  sub.style.display = 'none';
            if (wrap) wrap.classList.remove('open');
          } catch(ex){}
          window.handleLimitHit(type);
        }
      }, true);
    }
    gateBtn('imageUploadBtn', canImage, 'image');
    gateBtn('pdfUploadBtn',   canPdf,   'pdf');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchUploadBtns);
  } else {
    patchUploadBtns();
  }
  setTimeout(patchUploadBtns, 800);
  setTimeout(patchUploadBtns, 2500);

  /* ── HIDE message limit info entirely (no free chat messaging) – */
  var _origUpdateLimitUI = window.updateLimitUI;
  window.updateLimitUI = function () {
    try { if (typeof _origUpdateLimitUI === 'function') _origUpdateLimitUI(); } catch(e){}
    try {
      var el = document.getElementById('messageLimitInfo');
      if (el) el.remove();
      
      // Hide all message limit displays in sidebar - multiple selectors to catch all variations
      document.querySelectorAll('[data-limit="messages"], .message-limit-info, .free-chats-left, .chat-limit-badge, .limit-info, [data-chats-left], .chats-remaining, .sidebar-limit-counter, [class*="limit"], [class*="chat-count"], [class*="message-count"]').forEach(function(e) {
        if (e.textContent && (e.textContent.includes('left') || e.textContent.includes('chat') || e.textContent.includes('message'))) {
          e.style.display = 'none';
        }
      });
      
      // Aggressively hide anything mentioning "left" or chat limits
      document.querySelectorAll('*').forEach(function(el) {
        if (el.textContent && /(\d+\s+(chats?|messages?)\s+left|free.*(chat|message))/i.test(el.textContent) && el.classList && el.classList.length > 0) {
          el.style.display = 'none';
        }
      });
      
    } catch(e) {}
  };
  
  // Call immediately and periodically
  window.updateLimitUI();
  setInterval(function() {
    window.updateLimitUI();
  }, 3000);

  /* ── Voice/Microphone Premium Gate ──────────────────────────── */
  function patchVoiceGate() {
    const voiceBtn = document.getElementById('voiceInputBtn');
    if (!voiceBtn || voiceBtn._voiceGateBound) return;
    voiceBtn._voiceGateBound = true;
    voiceBtn.addEventListener('click', function(e) {
      const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
      const isPrem = uid ? (localStorage.getItem('sscai_u:' + uid + ':premium') === 'true') : false;
      
      if (!isPrem) {
        e.preventDefault();
        e.stopImmediatePropagation();
        try { if (typeof showToast === 'function') showToast('🔒 Voice input requires Premium'); } catch(e){}
        openPremium();
        return false;
      }
    }, true);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchVoiceGate);
  } else {
    patchVoiceGate();
  }
  setTimeout(patchVoiceGate, 800);
  setTimeout(patchVoiceGate, 2500);

  /* ── Guest gate for Premium modal - prevent guests from seeing premium options ── */
  function patchPremiumModal() {
    var _origOpenPremium = window.openPremiumModal;
    window.openPremiumModal = function() {
      const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
      
      if (!uid) {
        try { if (typeof showToast === 'function') showToast('🔒 Please login first to view premium plans'); } catch(e){}
        return false;
      }
      
      if (typeof _origOpenPremium === 'function') return _origOpenPremium();
      var pm = document.getElementById('premiumModal');
      if (pm) pm.classList.add('active');
    };
    
    var upgradeBtn = document.getElementById('profileUpgradeBtn2');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', function(e) {
        const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
        
        if (!uid) {
          e.preventDefault();
          e.stopImmediatePropagation();
          try { if (typeof showToast === 'function') showToast('🔒 Please login first to upgrade'); } catch(ex){}
          return false;
        }
      }, true);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchPremiumModal);
  } else {
    patchPremiumModal();
  }
  setTimeout(patchPremiumModal, 800);
  setTimeout(patchPremiumModal, 2500);

  /* ── On login: sync premium status from Firestore ──────────– */
  if (typeof window._firebaseAuth !== 'undefined') {
    window._firebaseAuth.onAuthStateChanged(function(user) {
      if (user) {
        window.syncPremiumStatus(user.uid);
      }
    });
  }

  /* ── Periodic re-enforcement ──*/
  let _lastCheck = 0;
  setInterval(function () {
    if (document.visibilityState === 'hidden') return;
    const uid = (typeof window._firebaseAuth !== 'undefined' && window._firebaseAuth.currentUser) ? window._firebaseAuth.currentUser.uid : null;
    if (uid && (Date.now() - _lastCheck) > 60000) {
      _lastCheck = Date.now();
      window.syncPremiumStatus(uid).catch(() => {});
    }
    
    if (window.canSendText  !== canText)  window.canSendText  = canText;
    if (window.canSendImage !== canImage) window.canSendImage = canImage;
    if (window.canSendPdf   !== canPdf)   window.canSendPdf   = canPdf;
    window.isRewardActive = function () { return false; };
  }, 10000);

  console.info('[StrictGate] v2.1 FIXED — Premium users can now chat! 0 free chats, 3 FREE mock tests/day, 3 FREE battles/day');

})();

/* ── Mock Tests: Completely FREE and UNLIMITED for all users ── */
(function patchMockTestFree() {
  function patch() {
    // Override access check to always allow
    window.checkMockTestAccess = async function() {
      return { allowed: true, unlimited: true, reason: 'Mock tests are free for all users' };
    };
    
    // Override usage tracking to do nothing (no limits to track)
    window.trackMockTestUsage = async function() {
      // No-op: unlimited usage, nothing to track
      console.info('[StrictGate] Mock test started - unlimited access');
    };
    
    // Override daily usage counter to always return 0
    window.getMockTestUsageToday = async function() {
      return 0;
    };
    
    console.info('[StrictGate] 🎉 Mock Tests: UNLIMITED and FREE for all users');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patch);
  } else {
    patch();
  }
  
  setTimeout(patch, 100);
})();
