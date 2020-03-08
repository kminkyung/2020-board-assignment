function changeInput() {
  const code = `<input type="password" class="form-control rounded-0" id="password" name="password">
                <button type="button" class="btn btn-secondary rounded-0 ml-2" onclick="updatePassword();">변경</button>`;
  $("#tr_password").children("td").html(code);
}

function updatePassword() {
  const id = $("#id").text();
  const password = $("#password").val().trim();
  if(!getRegExp('password').test(password)) {
    alert("비빌번호는 문자 숫자 특수문자를 포함해 8~15자 이내여야 합니다.");
    return;
  }

  $.ajax({
    type: 'post',
    url: "/rest/update_password",
    data: {id, password},
    success: function(res) {
      console.log(res);
      alert("비밀번호가 변경되었습니다.");
      location.href = '/';
    }
  })
}