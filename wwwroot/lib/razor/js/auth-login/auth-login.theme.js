// ═══════════════════════════════════════════════════════════════
// 🌓 THEME DETECTION & APPLICATION
// Detects user's theme preference and applies it to the page
// ═══════════════════════════════════════════════════════════════
(function initTheme() {
  // Check localStorage first (user preference)
  const savedTheme = localStorage.getItem('coreui-theme');

  if (savedTheme) {
    document.documentElement.setAttribute('data-coreui-theme', savedTheme);
    console.log('Applied saved theme:', savedTheme);
    return;
  }

  // Default to Light Theme (ignore system preference)
  document.documentElement.setAttribute('data-coreui-theme', 'light');
  console.log('Applied default theme: light');
})();

// Listen for theme changes (optional - for real-time theme switching)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  // Only apply if user hasn't set a manual preference
  if (!localStorage.getItem('coreui-theme')) {
    const newTheme = e.matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-coreui-theme', newTheme);
    console.log('System theme changed to:', newTheme);
  }
});

$(document).ready(function () {
  // ═══════════════════════════════════════════════════════════════
  // 🌓 THEME TOGGLE HANDLER
  // ═══════════════════════════════════════════════════════════════
  // Set initial icon based on current theme
  const currentTheme = document.documentElement.getAttribute('data-coreui-theme');
  const $themeIconUse = $('#themeIconUse');
  const iconBasePath = $themeIconUse.attr('href').split('#')[0];
  if (currentTheme === 'dark') {
    $themeIconUse.attr('href', iconBasePath + '#cil-moon');
  } else {
    $themeIconUse.attr('href', iconBasePath + '#cil-sun');
  }

  // Theme toggle click handler
  $('#themeToggle').on('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-coreui-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Save to localStorage
    localStorage.setItem('coreui-theme', newTheme);

    // Apply immediately
    document.documentElement.setAttribute('data-coreui-theme', newTheme);

    // Update icon with smooth transition
    const $themeIconUse = $('#themeIconUse');
    const iconBasePath = $themeIconUse.attr('href').split('#')[0];
    if (newTheme === 'dark') {
      $themeIconUse.attr('href', iconBasePath + '#cil-moon');
    } else {
      $themeIconUse.attr('href', iconBasePath + '#cil-sun');
    }

    console.log('Theme changed to:', newTheme);
  });
});
