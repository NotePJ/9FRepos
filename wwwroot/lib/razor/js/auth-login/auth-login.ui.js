$(document).ready(function () {
  // ═══════════════════════════════════════════════════════════════
  // 👁️ PASSWORD SHOW/HIDE TOGGLE
  // ═══════════════════════════════════════════════════════════════
  $('#viewpass').on('click', function() {
    const $passInput = $('#password');
    const $icon = $(this).find('i');

    if ($passInput.attr('type') === 'password') {
      // ซ่อนอยู่ → แสดง
      $passInput.attr('type', 'text');
      $icon.removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
      // แสดงอยู่ → ซ่อน
      $passInput.attr('type', 'password');
      $icon.removeClass('fa-eye-slash').addClass('fa-eye');
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // ⌨️ ENTER KEY HANDLER
  // ═══════════════════════════════════════════════════════════════
  $('#formLogin input[type="text"], #formLogin input[type="password"]').on('keypress', function (e) {
    if (e.which === 13) { // Enter key
      e.preventDefault();
      $('#submitLogin').click();
    }
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎯 AUTO-FOCUS NEXT FIELD
  // ═══════════════════════════════════════════════════════════════
  $('#username').on('keypress', function (e) {
    if (e.which === 13) {
      e.preventDefault();
      $('#password').focus();
    }
  });

  $('#password').on('keypress', function (e) {
    if (e.which === 13) {
      e.preventDefault();
      // Submit directly since company has default selection
      $('#submitLogin').click();
    }
  });
});
