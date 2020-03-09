const checkSignUpForm = () => {
  if($("#id").data('use') !== 'true') {
    alert("아이디를 확인하세요.");
    $("#id").focus();
    return false;
  }
  if($("#password").data('use') !== 'true') {
    alert("비밀번호를 확인하세요.");
    $("#password").focus();
    return false;
  }
  if($("#name").data('use') !== 'true') {
    alert("이름을 확인하세요.");
    $("#name").focus();
    return false;
  }
  if($("#email").data('use') !== 'true') {
    alert("이메일을 확인하세요.");
    $("#email").focus();
    return false;
  }
  return true;
};

$("#id").on('blur', function() {
  const id = $("#id").val().trim();
  $("#id").data('use', "false");
  $("#valid_id").remove();

  if(!getRegExp('id').test(id)) {
    const comment = `<span class="text-secondary" id="valid_id">아이디는 영문자 숫자 조합 8~15자 이내여야 합니다.</span>`;
    $("#id").parent().append(comment);
    return;
  }
  validateID(id, function (validation) {
    console.log(validation);
    if(validation == false) {
      const comment = `<span class="text-secondary" id="valid_id">이미 존재하는 아이디입니다.</span>`;
      $("#id").parent().append(comment);
      return;
    }
    else {
      const comment = `<span class="text-secondary" id="valid_id">사용가능한 아이디 입니다.</span>`;
      $("#id").parent().append(comment);
      $("#id").data('use', "true");
    }
  });


});

$("#password").on('blur', function() {
  const password = $("#password").val();
  $("#password").data('use', "false");
  $("#valid_password").remove();

  if(!getRegExp('password').test(password)) {
    const comment = `<span class="text-secondary" id="valid_password">비빌번호는 문자 숫자 특수문자를 포함해 8~15자 이내여야 합니다.</span>`;
    $("#password").parent().append(comment);
    return;
  } else {
    const comment = `<span class="text-secondary" id="valid_password">사용가능한 비밀번호 입니다.</span>`;
    $("#password").parent().append(comment);
    $("#password").data('use', "true");
  }
});

$("#name").on('blur', function() {
  const name = $("#name").val().trim();
  $("#name").data('use', "false");
  $("#valid_name").remove();

  if(!getRegExp('name').test(name)) {
    const comment = `<span class="text-secondary" id="valid_name">이름은 한글 2자~8자 이내로 입력할 수 있습니다.</span>`;
    $("#name").parent().append(comment);
    return;
  } else {
    const comment = `<span class="text-secondary" id="valid_name">사용가능한 이름 입니다.</span>`;
    $("#name").parent().append(comment);
    $("#name").data('use', "true");
  }
});

$("#email").on('blur', function() {
  const email = $("#email").val().trim();
  $("#email").data('use', "false");
  $("#valid_email").remove();
  if(!getRegExp('email').test(email)) {
    const comment = `<span class="text-secondary" id="valid_email">이메일 양식을 확인해주세요. ex)email@gmail.com</span>`;
    $("#email").parent().append(comment);
    return;
  } else {
    const comment = `<span class="text-secondary" id="valid_email">사용 가능한 이메일 입니다.</span>`;
    $("#email").parent().append(comment);
    $("#email").data('use', "true");
  }
});

function validateID(id, callback) {
  $.ajax({
    type: 'get',
    url: `/rest/get_member_id/${id}`,
    success: function(res) {
      callback(res);
    }
  })
}