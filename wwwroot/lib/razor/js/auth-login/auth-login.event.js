$(document).ready(function () {
  // ═══════════════════════════════════════════════════════════════
  // 🔐 LOGIN HANDLER
  // ═══════════════════════════════════════════════════════════════

  $('#submitLogin').on('click', function () {
    const $button = $(this);
    const $spinner = $button.find('.loading-spinner');
    const $buttonText = $button.find('.button-text');

    // Get form values
    const username = $('#username').val().trim();
    const password = $('#password').val().trim();
    const company = $('input[name="company"]:checked').val();

    // Use global variable or data attribute for redirect path
    // ใช้ homePath เป็น fallback สำหรับ IIS virtual directory
    const redirect = window.loginConfig
      ? (window.loginConfig.redirectPath || window.loginConfig.homePath || './')
      : './';
    const authUrl = window.loginConfig ? window.loginConfig.authUrl : './Auth/Auth';

    // ═══════════════════════════════════════════════════════════
    // 1️⃣ CLIENT-SIDE VALIDATION
    // ═══════════════════════════════════════════════════════════
    if (!username) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากรอก Employee NO',
        confirmButtonColor: '#05a34a'
      });
      $('#username').focus();
      return;
    }

    if (!password) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากรอกรหัสผ่าน',
        confirmButtonColor: '#05a34a'
      });
      $('#password').focus();
      return;
    }

    if (!company) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณาเลือก Company',
        confirmButtonColor: '#05a34a'
      });
      $('#company_bjc').focus();
      return;
    }

    // ═══════════════════════════════════════════════════════════
    // 2️⃣ DISABLE FORM & SHOW LOADING
    // ═══════════════════════════════════════════════════════════
    $button.prop('disabled', true);
    $spinner.show();
    $buttonText.text('Signing in...');
    $('#username, #password').prop('disabled', true);
    $('input[name="company"]').prop('disabled', true);
    $('label[for^="company_"]').addClass('disabled');

    // ═══════════════════════════════════════════════════════════
    // 3️⃣ AJAX POST TO /Auth/Auth
    // ═══════════════════════════════════════════════════════════
    $.ajax({
      url: authUrl,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        username: username,
        password: password,
        company: company,
        redirect: redirect
      }),
      headers: {
        'RequestVerificationToken': $('input[name="__RequestVerificationToken"]').val()
      },
      success: function (response) {
        if (response.status) {
          // ✅ LOGIN SUCCESS
          Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบสำเร็จ',
            text: 'กำลังเปลี่ยนหน้า...',
            timer: 1500,
            showConfirmButton: false,
            allowOutsideClick: false
          }).then(() => {
            window.location.href = response.redirect;
          });
        } else {
          // ❌ LOGIN FAILED (shouldn't happen with 200 status)
          resetForm();
          Swal.fire({
            icon: 'error',
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            text: 'กรุณาลองใหม่อีกครั้ง',
            confirmButtonColor: '#05a34a'
          });
        }
      },
      error: function (xhr) {
        // ❌ LOGIN ERROR
        resetForm();

        let errorTitle = 'เข้าสู่ระบบไม่สำเร็จ';
        let errorMessage = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        let errorIcon = 'error';

        if (xhr.responseJSON && xhr.responseJSON.message) {
          // Get message from server response
          if (Array.isArray(xhr.responseJSON.message)) {
            errorMessage = xhr.responseJSON.message.join(', ');
          } else {
            errorMessage = xhr.responseJSON.message;
          }

          // Map specific error messages
          const msg = errorMessage.toLowerCase();
          if (msg.includes('ไม่พบผู้ใช้') || msg.includes('not found') || msg.includes('user not found')) {
            errorTitle = 'ไม่พบผู้ใช้';
            errorMessage = 'ไม่พบผู้ใช้ในระบบ กรุณาตรวจสอบ Employee NO';
            errorIcon = 'warning';
          } else if (msg.includes('รหัสผ่านไม่ถูกต้อง') || msg.includes('wrong password') || msg.includes('invalid password')) {
            errorTitle = 'รหัสผ่านไม่ถูกต้อง';
            errorMessage = 'กรุณาตรวจสอบรหัสผ่านและลองใหม่อีกครั้ง';
            errorIcon = 'error';
          } else if (msg.includes('ถูกล็อค') || msg.includes('locked')) {
            errorTitle = 'บัญชีถูกล็อค';
            errorMessage = 'บัญชีของคุณถูกล็อค กรุณาติดต่อผู้ดูแลระบบ';
            errorIcon = 'warning';
          } else if (msg.includes('ถูกระงับ') || msg.includes('inactive') || msg.includes('disabled')) {
            errorTitle = 'บัญชีถูกระงับ';
            errorMessage = 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
            errorIcon = 'warning';
          } else if (msg.includes('ad') || msg.includes('active directory')) {
            errorTitle = 'ยืนยันตัวตนไม่สำเร็จ';
            errorMessage = 'ไม่สามารถยืนยันตัวตนผ่าน AD กรุณาตรวจสอบข้อมูล';
            errorIcon = 'error';
          }
        } else if (xhr.status === 400) {
          errorMessage = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
        } else if (xhr.status === 401) {
          errorMessage = 'รหัสผ่านไม่ถูกต้อง';
        } else if (xhr.status === 403) {
          errorMessage = 'คุณไม่มีสิทธิ์เข้าถึงระบบนี้';
        } else if (xhr.status === 500) {
          errorMessage = 'เกิดข้อผิดพลาดของระบบ กรุณาติดต่อผู้ดูแลระบบ';
        } else if (xhr.status === 0) {
          errorTitle = 'ไม่สามารถเชื่อมต่อได้';
          errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
          errorIcon = 'warning';
        }

        Swal.fire({
          icon: errorIcon,
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: '#05a34a'
        });
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔄 RESET FORM FUNCTION
  // ═══════════════════════════════════════════════════════════════
  function resetForm() {
    const $button = $('#submitLogin');
    const $spinner = $button.find('.loading-spinner');
    const $buttonText = $button.find('.button-text');

    $button.prop('disabled', false);
    $spinner.hide();
    $buttonText.text('Sign In');
    $('#username, #password').prop('disabled', false);
    $('input[name="company"]').prop('disabled', false);
    $('label[for^="company_"]').removeClass('disabled');
  }
});
