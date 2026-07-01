/**
 * demo-leaderboard-players.js
 * ═══════════════════════════════════════════════════════════════════
 * Initializes demo players for the weekly leaderboard
 * These demo players appear to all users at same ranking, XP, and winnings
 * When real user's XP crosses demo player's XP, real user name replaces demo player
 * Demo players are stored in localStorage and do NOT use Firebase
 * ═══════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // Demo player avatar emoji map
  const DEMO_AVATAR_MAP = {
    'av_fire': '🔥',
    'av_lightning': '⚡',
    'av_rocket': '🚀',
    'av_crown': '👑',
    'av_diamond': '💎',
    'av_ninja': '🥷',
    'av_wizard': '🧙‍♂️',
    'av_robot': '🤖',
    'av_astronaut': '👨‍🚀',
    'av_dragon': '🐉',
    'av_legend': '⭐',
    'av_phoenix': '🦅',
    'av_unicorn': '🦄',
    'av_genius': '🧠',
    'av_king': '🤴',
    'av_lion': '🦁',
    'av_eagle': '🦅',
    'av_bear': '🐻',
    'av_snake': '🐍',
    'av_fox': '🦊'
  };

  // Demo players with real-looking names, massive XP, and winnings
  const DEMO_PLAYERS = [
    {
      uid: 'demo_1',
      name: 'Arjun Singh',
      xp: 45630,
      wins: 91,
      coins: 4563,
      avatar: 'av_fire'
    },
    {
      uid: 'demo_2',
      name: 'Priya Sharma',
      xp: 42150,
      wins: 84,
      coins: 4215,
      avatar: 'av_lightning'
    },
    {
      uid: 'demo_3',
      name: 'Rajesh Kumar',
      xp: 38920,
      wins: 78,
      coins: 3892,
      avatar: 'av_rocket'
    },
    {
      uid: 'demo_4',
      name: 'Neha Patel',
      xp: 35480,
      wins: 71,
      coins: 3548,
      avatar: 'av_crown'
    },
    {
      uid: 'demo_5',
      name: 'Vikram Reddy',
      xp: 32750,
      wins: 65,
      coins: 3275,
      avatar: 'av_diamond'
    },
    {
      uid: 'demo_6',
      name: 'Anjali Verma',
      xp: 29340,
      wins: 59,
      coins: 2934,
      avatar: 'av_ninja'
    },
    {
      uid: 'demo_7',
      name: 'Aditya Gupta',
      xp: 26810,
      wins: 54,
      coins: 2681,
      avatar: 'av_wizard'
    },
    {
      uid: 'demo_8',
      name: 'Deepika Singh',
      xp: 24560,
      wins: 49,
      coins: 2456,
      avatar: 'av_robot'
    },
    {
      uid: 'demo_9',
      name: 'Rohan Malhotra',
      xp: 22340,
      wins: 45,
      coins: 2234,
      avatar: 'av_astronaut'
    },
    {
      uid: 'demo_10',
      name: 'Shreya Nair',
      xp: 20150,
      wins: 40,
      coins: 2015,
      avatar: 'av_dragon'
    },
    {
      uid: 'demo_11',
      name: 'Akshay Tiwari',
      xp: 18920,
      wins: 38,
      coins: 1892,
      avatar: 'av_legend'
    },
    {
      uid: 'demo_12',
      name: 'Tanvi Ghosh',
      xp: 17640,
      wins: 35,
      coins: 1764,
      avatar: 'av_phoenix'
    },
    {
      uid: 'demo_13',
      name: 'Varun Joshi',
      xp: 16480,
      wins: 33,
      coins: 1648,
      avatar: 'av_unicorn'
    },
    {
      uid: 'demo_14',
      name: 'Pooja Das',
      xp: 15230,
      wins: 30,
      coins: 1523,
      avatar: 'av_genius'
    },
    {
      uid: 'demo_15',
      name: 'Himanshu Singh',
      xp: 14120,
      wins: 28,
      coins: 1412,
      avatar: 'av_king'
    },
    {
      uid: 'demo_16',
      name: 'Isha Kapoor',
      xp: 13850,
      wins: 28,
      coins: 1385,
      avatar: 'av_lion'
    },
    {
      uid: 'demo_17',
      name: 'Nikhil Pandey',
      xp: 13210,
      wins: 26,
      coins: 1321,
      avatar: 'av_eagle'
    },
    {
      uid: 'demo_18',
      name: 'Sana Khan',
      xp: 12890,
      wins: 26,
      coins: 1289,
      avatar: 'av_bear'
    },
    {
      uid: 'demo_19',
      name: 'Karan Desai',
      xp: 12540,
      wins: 25,
      coins: 1254,
      avatar: 'av_snake'
    },
    {
      uid: 'demo_20',
      name: 'Meera Iyer',
      xp: 12150,
      wins: 24,
      coins: 1215,
      avatar: 'av_fox'
    },
    {
      uid: 'demo_21',
      name: 'Aryan Saxena',
      xp: 11840,
      wins: 24,
      coins: 1184,
      avatar: 'av_fire'
    },
    {
      uid: 'demo_22',
      name: 'Diya Bose',
      xp: 11520,
      wins: 23,
      coins: 1152,
      avatar: 'av_lightning'
    },
    {
      uid: 'demo_23',
      name: 'Sameer Chopra',
      xp: 11200,
      wins: 22,
      coins: 1120,
      avatar: 'av_rocket'
    },
    {
      uid: 'demo_24',
      name: 'Riya Mehta',
      xp: 10890,
      wins: 22,
      coins: 1089,
      avatar: 'av_crown'
    },
    {
      uid: 'demo_25',
      name: 'Harsh Pandya',
      xp: 10560,
      wins: 21,
      coins: 1056,
      avatar: 'av_diamond'
    },
    {
      uid: 'demo_26',
      name: 'Nishi Rao',
      xp: 10240,
      wins: 20,
      coins: 1024,
      avatar: 'av_ninja'
    },
    {
      uid: 'demo_27',
      name: 'Bhavesh Kumar',
      xp: 9920,
      wins: 20,
      coins: 992,
      avatar: 'av_wizard'
    },
    {
      uid: 'demo_28',
      name: 'Priya Singh',
      xp: 9650,
      wins: 19,
      coins: 965,
      avatar: 'av_robot'
    },
    {
      uid: 'demo_29',
      name: 'Raj Verma',
      xp: 9340,
      wins: 19,
      coins: 934,
      avatar: 'av_astronaut'
    },
    {
      uid: 'demo_30',
      name: 'Divya Nambiar',
      xp: 9010,
      wins: 18,
      coins: 901,
      avatar: 'av_dragon'
    },
    {
      uid: 'demo_31',
      name: 'Vivaan Malhotra',
      xp: 8750,
      wins: 18,
      coins: 875,
      avatar: 'av_legend'
    },
    {
      uid: 'demo_32',
      name: 'Ananya Pathak',
      xp: 8480,
      wins: 17,
      coins: 848,
      avatar: 'av_phoenix'
    },
    {
      uid: 'demo_33',
      name: 'Siddharth Roy',
      xp: 8210,
      wins: 16,
      coins: 821,
      avatar: 'av_unicorn'
    },
    {
      uid: 'demo_34',
      name: 'Kavya Mishra',
      xp: 7950,
      wins: 16,
      coins: 795,
      avatar: 'av_genius'
    },
    {
      uid: 'demo_35',
      name: 'Amar Patel',
      xp: 7680,
      wins: 15,
      coins: 768,
      avatar: 'av_king'
    },
    {
      uid: 'demo_36',
      name: 'Neelu Gupta',
      xp: 7420,
      wins: 15,
      coins: 742,
      avatar: 'av_lion'
    },
    {
      uid: 'demo_37',
      name: 'Jatin Bhatt',
      xp: 7150,
      wins: 14,
      coins: 715,
      avatar: 'av_eagle'
    },
    {
      uid: 'demo_38',
      name: 'Simran Kaur',
      xp: 6890,
      wins: 14,
      coins: 689,
      avatar: 'av_bear'
    },
    {
      uid: 'demo_39',
      name: 'Advik Sharma',
      xp: 6620,
      wins: 13,
      coins: 662,
      avatar: 'av_snake'
    },
    {
      uid: 'demo_40',
      name: 'Zoya Khan',
      xp: 6350,
      wins: 13,
      coins: 635,
      avatar: 'av_fox'
    },
    {
      uid: 'demo_41',
      name: 'Nishan Singh',
      xp: 6080,
      wins: 12,
      coins: 608,
      avatar: 'av_fire'
    },
    {
      uid: 'demo_42',
      name: 'Aarav Reddy',
      xp: 5820,
      wins: 12,
      coins: 582,
      avatar: 'av_lightning'
    },
    {
      uid: 'demo_43',
      name: 'Manya Chatterjee',
      xp: 5550,
      wins: 11,
      coins: 555,
      avatar: 'av_rocket'
    },
    {
      uid: 'demo_44',
      name: 'Roshan Nath',
      xp: 5280,
      wins: 11,
      coins: 528,
      avatar: 'av_crown'
    },
    {
      uid: 'demo_45',
      name: 'Shruti Iyer',
      xp: 5010,
      wins: 10,
      coins: 501,
      avatar: 'av_diamond'
    },
    {
      uid: 'demo_46',
      name: 'Harish Bhat',
      xp: 4750,
      wins: 10,
      coins: 475,
      avatar: 'av_ninja'
    },
    {
      uid: 'demo_47',
      name: 'Lia Mukerjee',
      xp: 4480,
      wins: 9,
      coins: 448,
      avatar: 'av_wizard'
    },
    {
      uid: 'demo_48',
      name: 'Vikrant Singh',
      xp: 4210,
      wins: 8,
      coins: 421,
      avatar: 'av_robot'
    },
    {
      uid: 'demo_49',
      name: 'Poorna Mishra',
      xp: 3950,
      wins: 8,
      coins: 395,
      avatar: 'av_astronaut'
    },
    {
      uid: 'demo_50',
      name: 'Sarthak Patel',
      xp: 3680,
      wins: 7,
      coins: 368,
      avatar: 'av_dragon'
    }
  ];

  /**
   * Initialize demo leaderboard entries
   * Called on page load to populate localStorage
   */
  function initializeDemoLeaderboard() {
    try {
      const DEMO_LB_KEY = 'sscai_demo_lb_entries';
      
      // Get week keys to try (in case there's timezone differences)
      const weekKeys = getWeekKeysToCheck();
      
      // Check if demo entries already exist for any of these weeks
      let demoEntries = [];
      try {
        const stored = localStorage.getItem(DEMO_LB_KEY);
        if (stored) {
          demoEntries = JSON.parse(stored);
        }
      } catch(e) {
        demoEntries = [];
      }

      // Check if we already have fresh demo entries
      const now = Date.now();
      const lastInit = localStorage.getItem('sscai_demo_lb_init_time') || 0;
      const needsInit = !demoEntries.length || (now - parseInt(lastInit)) > 86400000; // 24 hours
      
      if (needsInit) {
        // Create fresh demo entries that work for BOTH weekly AND all-time leaderboards
        // Solution: Include weekKey for weekly filtering, but make them also appear in all-time
        const newDemoEntries = [];
        const primaryWeekKey = weekKeys[0]; // Use the primary (current) week key
        
        DEMO_PLAYERS.forEach(player => {
          // Create entry that works for BOTH views
          // - Has weekKey for weekly view filter
          // - Will also be included in all-time view (no filtering by weekKey in all-time)
          newDemoEntries.push({
            uid: player.uid,
            name: player.name,
            xp: player.xp,
            wins: player.wins,
            coins: player.coins,
            avatar: DEMO_AVATAR_MAP[player.avatar] || '🧑‍🎓',
            avatarId: player.avatar,
            weekKey: primaryWeekKey,
            _demo: true,
            battles: Math.ceil(player.wins * 1.3),
            displayName: player.name,
            email: ''
          });
        });

        // Store in localStorage
        localStorage.setItem(DEMO_LB_KEY, JSON.stringify(newDemoEntries));
        localStorage.setItem('sscai_demo_lb_init_time', String(now));
        
        console.log('[Demo Leaderboard] ✅ Initialized', newDemoEntries.length, 'demo players');
        console.log('[Demo Leaderboard] Players appear in BOTH weekly and all-time leaderboards');
        console.log('[Demo Leaderboard] Week keys checked:', weekKeys);
        console.log('[Demo Leaderboard] Using week key:', primaryWeekKey);
        console.log('[Demo Leaderboard] Sample entry:', newDemoEntries[0]);
      }
    } catch(error) {
      console.error('[Demo Leaderboard] Error initializing:', error);
    }
  }

  /**
   * Get multiple possible week keys to handle timezone variations
   * Returns array with primary week key first
   */
  function getWeekKeysToCheck() {
    const keys = [];
    
    // Current week (primary)
    const currentWeekKey = getWeekKeyForDemo();
    keys.push(currentWeekKey);
    
    // Previous week (in case of timezone shifts at week boundary)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const prevKey = getWeekKeyFormat(yesterday);
    if (prevKey !== currentWeekKey) keys.push(prevKey);
    
    return keys;
  }

  /**
   * Helper to format week key consistently with battle-arena-patch.js
   * Format must be: YYYY_W# (e.g., "2026_W27" with underscore, NO leading zero)
   */
  function getWeekKeyFormat(date) {
    const now = new Date(date);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    return now.getFullYear() + '_W' + week;  // IMPORTANT: underscore, no leading zero on week
  }

  /**
   * Get current week key (must match battle-arena-patch.js getWeekKey())
   * Format: "YYYY_W#" (e.g., "2026_W27")
   */
  function getWeekKeyForDemo() {
    return getWeekKeyFormat(new Date());
  }

  /**
   * Update demo player XP (optional - for future dynamic adjustments)
   * This allows you to modify demo player XP without reloading
   */
  window.updateDemoPlayerXP = function(demoUid, newXP) {
    try {
      const DEMO_LB_KEY = 'sscai_demo_lb_entries';
      const demoEntries = JSON.parse(localStorage.getItem(DEMO_LB_KEY) || '[]');
      const entry = demoEntries.find(e => e.uid === demoUid);
      
      if (entry) {
        entry.xp = newXP;
        localStorage.setItem(DEMO_LB_KEY, JSON.stringify(demoEntries));
        
        // Trigger leaderboard refresh if BA is available
        if (window.BA && typeof window.BA._renderLeaderboard === 'function') {
          window.BA._renderLeaderboard();
        }
      }
    } catch(error) {
      console.error('[Demo Leaderboard] Error updating XP:', error);
    }
  };

  /**
   * Inspect demo players and week key (for debugging)
   */
  window.inspectDemoLeaderboard = function() {
    const DEMO_LB_KEY = 'sscai_demo_lb_entries';
    const demoData = JSON.parse(localStorage.getItem(DEMO_LB_KEY) || '[]');
    const currentWeekKey = getWeekKeyForDemo();
    
    console.log('🔍 Demo Leaderboard Inspection:');
    console.log('Current Week Key:', currentWeekKey);
    console.log('═══════════════════════════════════════');
    console.log('📊 LEADERBOARD STATUS:');
    console.log('  Total demo players in storage:', demoData.length);
    console.log('  Expected: 50 players');
    console.log('  All players appear in BOTH tabs');
    console.log('═══════════════════════════════════════');
    
    if (demoData.length > 0) {
      const weeklyMatch = demoData.filter(e => e.weekKey === currentWeekKey);
      console.log('  Players for current week (' + currentWeekKey + '):', weeklyMatch.length);
      console.log('');
      console.log('Sample Entry #1:');
      console.log('  Name:', demoData[0].name);
      console.log('  XP:', demoData[0].xp);
      console.log('  Wins:', demoData[0].wins);
      console.log('  Avatar:', demoData[0].avatar);
      console.log('═══════════════════════════════════════');
      console.log('All entries:', demoData);
    } else {
      console.log('⚠️  No demo players found! Data may not have initialized.');
    }
  };

  /**
   * Get all demo players (for debugging or admin features)
   */
  window.getDemoPlayers = function() {
    try {
      const DEMO_LB_KEY = 'sscai_demo_lb_entries';
      return JSON.parse(localStorage.getItem(DEMO_LB_KEY) || '[]');
    } catch(error) {
      return [];
    }
  };

  /**
   * Clear demo players from localStorage (for testing)
   */
  window.clearDemoPlayers = function() {
    try {
      localStorage.removeItem('sscai_demo_lb_entries');
      console.log('[Demo Leaderboard] Cleared demo players');
    } catch(error) {
      console.error('[Demo Leaderboard] Error clearing:', error);
    }
  };

  /**
   * Reset demo players for all users (reinitialize)
   */
  window.resetDemoPlayers = function() {
    try {
      clearDemoPlayers();
      initializeDemoLeaderboard();
      console.log('[Demo Leaderboard] Reset complete');
    } catch(error) {
      console.error('[Demo Leaderboard] Error resetting:', error);
    }
  };

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDemoLeaderboard);
  } else {
    // DOM is already ready
    initializeDemoLeaderboard();
  }

  // Also initialize when this script loads (in case it's loaded late)
  initializeDemoLeaderboard();

})();