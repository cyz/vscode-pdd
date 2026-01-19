/**
 * Theme Management for NoteBoard App
 * Handles dark/light mode switching with localStorage persistence
 */

(function() {
  'use strict';

  const THEME_KEY = 'noteboard-theme';
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
  };

  /**
   * Get initial theme based on:
   * 1. localStorage preference
   * 2. System preference (prefers-color-scheme)
   * 3. Default to light
   */
  function getInitialTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme && (savedTheme === THEMES.LIGHT || savedTheme === THEMES.DARK)) {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.DARK;
    }

    return THEMES.LIGHT;
  }

  /**
   * Apply theme to the document
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    
    // Update ARIA label for accessibility
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      const newLabel = theme === THEMES.DARK 
        ? 'Switch to light mode' 
        : 'Switch to dark mode';
      toggleButton.setAttribute('aria-label', newLabel);
    }
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    applyTheme(newTheme);
  }

  /**
   * Initialize theme on page load
   */
  function initTheme() {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    // Set up toggle button listener
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleTheme);
      
      // Support keyboard navigation
      toggleButton.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (!savedTheme) {
          applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
        }
      });
    }
  }

  // Apply theme immediately to prevent flash
  applyTheme(getInitialTheme());

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }

  // Expose toggle function globally for potential external use
  window.toggleTheme = toggleTheme;
})();
