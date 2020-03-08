
function checkLoginForm() {
  const id = $("#id").val().trim();
  const pw = $("#pw").val().trim();

  if(id == '' || !getRegExp('id').test(id)) {
    alert("아이디를 올바르게 입력해주세요.");
    return false;
  }
  if(pw == '' || !getRegExp('password').test(pw)) {
    alert("비밀번호를 올바르게 입력해주세요.");
    return false;
  }
  return true;
}