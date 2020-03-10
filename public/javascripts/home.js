function changeInput() {
  const code = `<input type="password" class="form-control rounded-0" id="password" name="password">
                <button type="button" class="btn btn-secondary rounded-0 ml-2" onclick="updatePassword();">변경</button>`;
  $("#tr_password").children("td").html(code);
}

function changeGrade(btn) {
  const td_el = $(btn).parent().prev();
  const btn_el = $(btn).parent();
  const td_code = `<select class="custom-select" id="select_grade">
                    <option value="1">일반</option>
                    <option value="9">관리자</option>
                  </select>`;
  const btn_code = `<button type="button" class="btn btn-secondary btn-sm rounded-0" onclick="updateGrade(this);" style="width: 66px;">수정</button>`;
  td_el.html(td_code);
  btn_el.html(btn_code);
}

function showMemberList() {
  $("#user_list_container").remove();
  $("#btnHideList").removeClass("d-none");
  $("#btnShowList").addClass("d-none");
  const id = $("#id").text();
  const manage_button = `<button type="button" class="btn btn-secondary btn-sm rounded-0" onclick="changeGrade(this);">등급변경</button>`;
  
  getMemberList(function (list) {
    const code = `<div class="container border shadow-box mx-auto my-5 p-5 pb-0" id="user_list_container" style="width: 700px">
                  <h4 class="mb-4">유저목록</h4>
                  <table class="table table-bordered text-center" id="user_list_table">
                    <thead>
                    <tr>
                      <th>아이디</th>
                      <th>이름</th>
                      <th>이메일</th>
                      <th width="110">등급</th>
                      <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
    ${list.map(v => `<tr>
                        <td>${v.id}</td>
                        <td>${v.name}</td>
                        <td>${v.email}</td>
                        <td>${v.grade == 9 ? "관리자" : "일반"}</td>
                        <td data-id="${v.id}">
                          ${v.id !== id ? manage_button : ''}
                        </td>
                       </tr>`).reduce((a, b) => a+b)}
                    </tbody>
                  </table>
              </div>`;
    $("body").append(code);
  });
}

function hideMemberList() {
  $("#user_list_container").remove();
  $("#btnHideList").addClass("d-none");
  $("#btnShowList").removeClass("d-none");
}

function ShowBoard() {
  const code = `<div class="container border shadow-box mx-auto my-5 p-5 pb-0" id="user_list_container" style="width: 700px">
                  <div class="d-flex justify-content-between align-items-start">
                    <h4 class="mb-4">게시판</h4>
                    <button type="button" class="btn btn-secondary rounded-0" onclick="showWriteModal();">글쓰기</button>                  
                  </div>
            
                  <table class="table table-bordered text-center" id="user_list_table">
                    <thead>
                    <tr>
                      <th>글번호</th>
                      <th>작성자</th>
                      <th>제목</th>
                      <th>작성일</th>
                      <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                  </table>
              </div>`;
    $("body").append(code);
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
    url: "/rest/update_member_password",
    data: {id, password},
    error: function(err) {
      console.log(err);
    },
    success: function(res) {
      // console.log(res);
      alert("비밀번호가 변경되었습니다.");
      location.href = '/';
    }
  })
}

function getMemberList(callback) {
  $.ajax({
    type: 'get',
    url: "/rest/get_member_list",
    error: function(err) {
      callback(false);
    },
    success: function(res) {
      callback(JSON.parse(res));
    }
  });
}

function updateGrade(btn) {
  const id = $(btn).parent().data("id");
  const grade = $(btn).parents("tr").find("#select_grade").val();

  $.ajax({
    type: 'post',
    url: "/rest/update_member_grade",
    data: {id, grade},
    error: function(err) {
      callback(false);
    },
    success: function(res) {
      alert("등급이 변경되었습니다.");
      location.href = '/';
    }
  });
}