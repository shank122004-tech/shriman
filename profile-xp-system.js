/**
 * profile-xp-system.js — Level & Experience System v2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * FEATURES:
 * ✅ Real-time XP tracking and display in user profile
 * ✅ Level calculation (100 XP per level)
 * ✅ XP progress bar with next level milestone
 * ✅ Test statistics (total tests, average accuracy)
 * ✅ Beautiful gradient UI with premium design
 * ✅ Integrates with mock-test.js XP system
 * ✅ LocalStorage sync for offline access
 * ✅ Firebase Firestore sync for cloud storage
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Update XP Display in Profile Section
// ═══════════════════════════════════════════════════════════════════════════════

function updateXPDisplay(uid, totalXP) {
  try {
    if (!uid) return;
    
    // Try to load from Firestore first (for cross-device sync)
    if (window._firebaseDb && window._firebaseFns?.getDoc && window._firebaseFns?.doc) {
      const { doc, getDoc } = window._firebaseFns;
      const userRef = doc(window._firebaseDb, 'users', uid);
      
      getDoc(userRef).then(userSnap => {
        if (userSnap.exists() && userSnap.data().totalXP !== undefined) {
          console.log('[XP] Loaded from Firestore');
          updateXPDisplayWithValue(uid, userSnap.data().totalXP);
        } else {
          console.log('[XP] No data in Firestore, using localStorage');
          const xpStorageKey = `sscai_u:${uid}:totalXP`;
          const xpValue = parseInt(localStorage.getItem(xpStorageKey) || '0');
          updateXPDisplayWithValue(uid, xpValue);
        }
      }).catch(err => {
        console.log('[XP] Firestore error, using localStorage:', err);
        const xpStorageKey = `sscai_u:${uid}:totalXP`;
        const xpValue = parseInt(localStorage.getItem(xpStorageKey) || '0');
        updateXPDisplayWithValue(uid, xpValue);
      });
    } else {
      // Firebase not available, use localStorage
      const xpStorageKey = `sscai_u:${uid}:totalXP`;
      const xpValue = totalXP || parseInt(localStorage.getItem(xpStorageKey) || '0');
      updateXPDisplayWithValue(uid, xpValue);
    }
  } catch(e) {
    console.error('[XP Display] Error updating display:', e);
  }
}

function updateXPDisplayWithValue(uid, xpValue) {
  try {
    // Calculate level (100 XP per level)
    const level = Math.floor(xpValue / 100) + 1;
    const xpInCurrentLevel = xpValue % 100;
    const nextLevelXP = 100;
    const xpPercent = (xpInCurrentLevel / nextLevelXP) * 100;
    
    // Update all XP display elements in profile
    const xpCurrentDisplay = document.getElementById('xpCurrentDisplay');
    if (xpCurrentDisplay) xpCurrentDisplay.textContent = xpValue + ' XP';
    
    const xpLevelBadge = document.getElementById('xpLevelBadge');
    if (xpLevelBadge) xpLevelBadge.textContent = level;
    
    const xpBarFill = document.getElementById('xpBarFill');
    if (xpBarFill) xpBarFill.style.width = xpPercent + '%';
    
    const xpBarText = document.getElementById('xpBarText');
    if (xpBarText) xpBarText.textContent = xpInCurrentLevel + ' / ' + nextLevelXP + ' XP to next level';
    
    // Update level display in profile
    const xpLevelDisplay = document.getElementById('xpLevelDisplay');
    if (xpLevelDisplay) xpLevelDisplay.textContent = 'Level ' + level;
    
    // Update profile XP values if they exist
    const profileXPVal = document.getElementById('profileXPVal');
    if (profileXPVal) profileXPVal.textContent = xpValue;
    
    const profileXPLevel = document.getElementById('profileXPLevel');
    if (profileXPLevel) profileXPLevel.textContent = level;
    
    // Get mock test history for stats
    try {
      const historyKey = `sscai_u:${uid}:mock_history`;
      const historyData = localStorage.getItem(historyKey);
      const history = historyData ? JSON.parse(historyData) : [];
      
      if (history.length > 0) {
        // Update tests count
        const xpTestsCount = document.getElementById('xpTestsCount');
        if (xpTestsCount) xpTestsCount.textContent = history.length;
        
        // Calculate average accuracy
        const totalAccuracy = history.reduce((sum, test) => sum + (test.percentage || 0), 0);
        const avgAccuracy = Math.round(totalAccuracy / history.length);
        const xpAvgAccuracy = document.getElementById('xpAvgAccuracy');
        if (xpAvgAccuracy) xpAvgAccuracy.textContent = avgAccuracy + '%';
      }
    } catch(e) {
      console.log('Could not update test stats:', e);
    }
    
    console.log('[XP Display] Updated - Total XP:', xpValue, 'Level:', level);
  } catch(e) {
    console.error('[XP Display] Error with value update:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Create Profile XP Section HTML
// ═══════════════════════════════════════════════════════════════════════════════

function createProfileXPSection() {
  return `
    <div id="profileXPSection" class="profile-section-card" style="background:linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.05)) !important;border:1.5px solid rgba(16,185,129,0.25) !important;border-radius:16px !important;padding:24px !important;margin-bottom:20px !important;">
      <div style="display:flex !important;align-items:center !important;gap:20px !important;margin-bottom:24px !important;">
        <div style="font-size:40px !important;">⭐</div>
        <div>
          <h3 style="margin:0 0 4px 0 !important;font-size:18px !important;font-weight:700 !important;color:#ffffff !important;">Level & Experience</h3>
          <p style="margin:0 !important;font-size:12px !important;color:rgba(255,255,255,0.6) !important;">Earn XP by taking mock tests</p>
        </div>
      </div>

      <div style="display:grid !important;grid-template-columns:1fr 1fr !important;gap:20px !important;margin-bottom:24px !important;">
        <!-- Level Card -->
        <div style="background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08)) !important;border:1px solid rgba(16,185,129,0.2) !important;border-radius:12px !important;padding:16px !important;text-align:center !important;">
          <div style="font-size:12px !important;color:rgba(255,255,255,0.6) !important;margin-bottom:8px !important;text-transform:uppercase !important;letter-spacing:0.5px !important;font-weight:600 !important;">Current Level</div>
          <div id="xpLevelBadge" style="font-size:36px !important;font-weight:800 !important;color:#10b981 !important;margin-bottom:4px !important;">1</div>
          <div style="font-size:11px !important;color:rgba(255,255,255,0.5) !important;">Keep grinding! 💪</div>
        </div>

        <!-- Total XP Card -->
        <div style="background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08)) !important;border:1px solid rgba(16,185,129,0.2) !important;border-radius:12px !important;padding:16px !important;text-align:center !important;">
          <div style="font-size:12px !important;color:rgba(255,255,255,0.6) !important;margin-bottom:8px !important;text-transform:uppercase !important;letter-spacing:0.5px !important;font-weight:600 !important;">Total Experience</div>
          <div id="xpCurrentDisplay" style="font-size:28px !important;font-weight:800 !important;color:#10b981 !important;margin-bottom:4px !important;">0 XP</div>
          <div style="font-size:11px !important;color:rgba(255,255,255,0.5) !important;">Awesome progress! 🚀</div>
        </div>
      </div>

      <!-- XP Progress Bar -->
      <div style="margin-bottom:20px !important;">
        <div style="display:flex !important;justify-content:space-between !important;margin-bottom:8px !important;">
          <label style="font-size:12px !important;color:rgba(255,255,255,0.7) !important;font-weight:600 !important;">To Next Level</label>
          <span id="xpBarText" style="font-size:11px !important;color:rgba(255,255,255,0.5) !important;">0 / 100 XP to next level</span>
        </div>
        <div style="width:100% !important;height:8px !important;background:rgba(255,255,255,0.08) !important;border-radius:4px !important;overflow:hidden !important;border:1px solid rgba(16,185,129,0.2) !important;">
          <div id="xpBarFill" style="height:100% !important;width:0% !important;background:linear-gradient(90deg,#10b981,#059669) !important;transition:width 0.5s ease !important;"></div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div style="display:grid !important;grid-template-columns:1fr 1fr !important;gap:12px !important;">
        <div style="background:rgba(108,99,255,0.08) !important;border:1px solid rgba(108,99,255,0.15) !important;border-radius:10px !important;padding:12px !important;text-align:center !important;">
          <div style="font-size:11px !important;color:rgba(255,255,255,0.5) !important;margin-bottom:6px !important;text-transform:uppercase !important;letter-spacing:0.4px !important;font-weight:600 !important;">Tests Taken</div>
          <div id="xpTestsCount" style="font-size:22px !important;font-weight:800 !important;color:#6c63ff !important;">0</div>
        </div>
        <div style="background:rgba(108,99,255,0.08) !important;border:1px solid rgba(108,99,255,0.15) !important;border-radius:10px !important;padding:12px !important;text-align:center !important;">
          <div style="font-size:11px !important;color:rgba(255,255,255,0.5) !important;margin-bottom:6px !important;text-transform:uppercase !important;letter-spacing:0.4px !important;font-weight:600 !important;">Avg Accuracy</div>
          <div id="xpAvgAccuracy" style="font-size:22px !important;font-weight:800 !important;color:#fbbf24 !important;">0%</div>
        </div>
      </div>

      <!-- Info Box -->
      <div style="margin-top:20px !important;background:rgba(59,130,246,0.08) !important;border-left:3px solid #3b82f6 !important;border-radius:8px !important;padding:12px !important;">
        <p style="margin:0 !important;font-size:12px !important;color:rgba(255,255,255,0.7) !important;line-height:1.5 !important;">
          <strong>💡 How XP Works:</strong> Each correct answer = +5 XP | Each wrong answer = -3 XP. Complete tests to earn XP and level up!
        </p>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Initialize Profile XP Section
// ═══════════════════════════════════════════════════════════════════════════════

function initializeProfileXPSection(uid) {
  try {
    if (!uid) return;
    
    // Try to insert XP section into profile
    const profileContainer = document.querySelector('[data-section="profile"]') || 
                            document.getElementById('profileSection') ||
                            document.querySelector('.profile-logged-in');
    
    if (!profileContainer) {
      console.log('[XP] Profile container not found, will try again on next profile load');
      return;
    }
    
    // Remove existing XP section if any
    const existingSection = document.getElementById('profileXPSection');
    if (existingSection) existingSection.remove();
    
    // Insert new XP section
    const xpSection = document.createElement('div');
    xpSection.innerHTML = createProfileXPSection();
    
    // Insert at the beginning of profile
    const firstChild = profileContainer.querySelector('.profile-section-card');
    if (firstChild) {
      firstChild.parentNode.insertBefore(xpSection.firstElementChild, firstChild);
    } else {
      profileContainer.insertBefore(xpSection.firstElementChild, profileContainer.firstChild);
    }
    
    // Update the display
    updateXPDisplay(uid);
    
    console.log('[XP] Profile XP section initialized');
  } catch(e) {
    console.error('[XP] Error initializing profile section:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Watch for Profile Changes and Update XP
// ═══════════════════════════════════════════════════════════════════════════════

function setupXPDisplayObserver() {
  try {
    // Check if user profile is shown and update XP display
    const originalShowProfile = window.showProfile;
    if (typeof originalShowProfile === 'function') {
      window.showProfile = function(...args) {
        const result = originalShowProfile.apply(this, args);
        
        // Get current user
        const user = window._firebaseAuth?.currentUser || 
                    (window.state && window.state.user);
        
        if (user && user.uid) {
          setTimeout(() => {
            initializeProfileXPSection(user.uid);
            updateXPDisplay(user.uid);
          }, 100);
        }
        
        return result;
      };
    }

    // Also watch for profile updates
    const originalUpdateProfileUI = window.updateProfileUI;
    if (typeof originalUpdateProfileUI === 'function') {
      window.updateProfileUI = function(...args) {
        const result = originalUpdateProfileUI.apply(this, args);
        
        const user = window._firebaseAuth?.currentUser || 
                    (window.state && window.state.user);
        
        if (user && user.uid) {
          setTimeout(() => {
            updateXPDisplay(user.uid);
          }, 50);
        }
        
        return result;
      };
    }
  } catch(e) {
    console.log('[XP] Could not setup observer:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export for Integration
// ═══════════════════════════════════════════════════════════════════════════════

// Make functions globally available
window.updateXPDisplay = window.updateXPDisplay || updateXPDisplay;
window.initializeProfileXPSection = window.initializeProfileXPSection || initializeProfileXPSection;

// Initialize on document ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupXPDisplayObserver);
} else {
  setupXPDisplayObserver();
}

// ═══════════════════════════════════════════════════════════════════════════════
// Inject CSS Styles
// ═══════════════════════════════════════════════════════════════════════════════

(function() {
  const styles = document.createElement('style');
  styles.textContent = `
    /* Profile XP Section Styles */
    .profile-section-card {
      transition: all 0.3s ease !important;
    }

    .profile-section-card:hover {
      border-color: rgba(16, 185, 129, 0.4) !important;
    }

    #xpLevelBadge {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 60px !important;
      height: 60px !important;
      background: linear-gradient(135deg, #10b981, #059669) !important;
      border-radius: 50% !important;
      color: #ffffff !important;
      margin: 8px auto !important;
      font-size: 28px !important;
      font-weight: 800 !important;
    }

    #xpBarFill {
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.3) !important;
    }

    /* Level up animation */
    @keyframes levelUpPulse {
      0% {
        transform: scale(1) !important;
      }
      50% {
        transform: scale(1.1) !important;
      }
      100% {
        transform: scale(1) !important;
      }
    }

    .level-up {
      animation: levelUpPulse 0.6s ease-out !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      #profileXPSection {
        padding: 16px !important;
      }

      #profileXPSection > div:first-child {
        flex-direction: column !important;
      }
    }
  `;
  
  if (!document.head.querySelector('style[data-xp-system-styles]')) {
    styles.setAttribute('data-xp-system-styles', 'true');
    document.head.appendChild(styles);
  }
})();

console.log('[XP System] Profile XP Display System v2.0.0 initialized');