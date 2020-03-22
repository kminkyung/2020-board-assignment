/* global */
const size_limit = 1024 * 1024 * 10;



/* event */
$("#board_detail_modal").on("hide.bs.modal", function () {
  $("#btnUpdate").addClass("d-none");
  $("#btnModify").removeClass("d-none");
});


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
    const code = `<div class="container border shadow-box mx-auto my-5 p-5 pb-0" id="user_list_container">
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
                       </tr>`).reduce((a, b) => a + b)}
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

function hideBoard() {
  $("#board_list_container").remove();
  $("#btnHideBoard").addClass("d-none");
  $("#btnShowBoard").removeClass("d-none");
}


async function drawBoard(page) {
  const remove_btn_code = `<button type="button" class="btn btn-secondary btn-sm rounded-0" id="btnRemove" onclick="confirmRemovePost(this);">삭제</button>`;
  const showmore_btn_code = `<div class="text-center"><button type="button" class="btn btn-secondary rounded-0" id="btnShowMore" onclick="drawBoard(${page + 1})">더 보기</button></div>`;
  const data = await getBoardList(page);
  console.log(data);
  // $("#board_list_table tbody").empty();
  if (data.list.length == 0) {
    $("#board_list_table tbody").append(`<tr><td colspan="6">게시글이 없습니다.</td></tr>`);
  } else {
    const tbody_code = data.list.map(v => `<tr class="pointer" onclick="showDetailModal(this);">
                                            <td data-idx="${v.idx}">${v.idx}</td>
                                            <td>${v.id}</td>
                                            <td>${v.title} ${v.cmt_count !== 0 ? `<span class="badge badge-pill badge-dark">${v.cmt_count}</span>` : ''}</td>
                                            <td>${v.content}</td>
                                            <td>${v.savefile !== '' ? '💾' : v.savefile}</td>
                                            <td>${v.date}</td>
                                            <td>
                                              ${grade == 9 ? remove_btn_code : id == v.id ? remove_btn_code : ''}
                                            </td>
                                         </tr>`);
    $("#board_list_table tbody").append(tbody_code);
  }

  if (data.is_next !== true) {
    $("#btnShowMore").remove();
  } else {
    $("#board_list_container").append(showmore_btn_code);
  }
}



function showBoard(page) {
  $("#board_list_container").remove();
  $("#btnHideBoard").removeClass("d-none");
  $("#btnShowBoard").addClass("d-none");
   const code = `<div class="container border shadow-box mx-auto my-5 p-5 pb-0" id="board_list_container">
                  <div class="d-flex justify-content-between align-items-start">
                    <h4 class="mb-4">게시판</h4>
                    <button type="button" class="btn btn-secondary rounded-0" onclick="showWriteModal();">글쓰기</button>
                  </div>
            
                  <table class="table table-bordered text-center table-ellipsis" id="board_list_table">
                    <thead>
                    <tr>
                      <th width="40">No.</th>
                      <th>작성자</th>
                      <th>제목</th>
                      <th>내용</th>
                      <th width="50">파일</th>
                      <th>작성일</th>
                      <th width="70">관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    </tbody>
                  </table>
              </div>`;
    $("body").append(code);
    drawBoard(page);
}



function modifyPost(btn) {
  const title_val = $(btn).parents("#board_detail_modal").find("#title").text();
  const content_val = $(btn).parents("#board_detail_modal").find("#content").text();
  $(btn).parents("#board_detail_modal").find("#title").html(`<input type='text' class="form-control rounded-0" name="title">`);
  $(btn).parents("#board_detail_modal").find("#content").html(`<textarea class="form-control rounded-0" name="content" rows="6"></textarea>`);
  $("input[name='title']").val(title_val);
  $("textarea[name='content']").val(content_val);
  $("#btnUpdate").removeClass("d-none");
  $("#btnModify").addClass("d-none");
  $("#btnCancel").prop("disabled", false);

}

function submitUpdatePost(form) {
  const title = $(form).find("input[name='title']").val();
  const content = $(form).find("textarea[name='content']").val();
  if (title.trim() == '') {
    alert("제목을 입력해주세요.");
    return false;
  }
  if (content.trim() == '') {
    alert("내용을 입력해주세요.");
    return false;
  }
  return true;
}


function confirmRemovePost(t) {
  event.stopPropagation();
  const idx = $(t).parents("tr").children("td:first-child").data("idx");
  if (confirm("정말로 삭제하시겠습니까?")) {
    removePost(idx, function (res) {
      console.log(res);
      if (res.code !== 200) {
        alert("권한이 없습니다.");
        return;
      }
      alert("삭제되었습니다.");
      location.reload();
    })
  }
}

function removePost(idx, callback) {
  $.ajax({
    type: 'post',
    url: `/rest/remove_board_post/${idx}`,
    error: function (err) {
      console.log(err);
    },
    success: function (res) {
      callback(res);
    }
  })
}

function showWriteModal() {
  $("#board_write_modal").modal("show");
}

function cancelModify(t) {
  const idx = $(t).parents("#board_detail_modal").find("input[name='idx']").val();
  const modal = $(t).parents("#board_detail_modal");
 $("#btnUpdate").addClass("d-none");
 $("#btnModify").removeClass("d-none");
 $("#btnCancel").prop("disabled", true);

  $("input[name='title']").remove();
  $("textarea[name='content']").remove();
  getBoardPost(idx, function (data) {
    console.log(data);
    modal.find("#title").text(data.title);
    modal.find("#content").text(data.content);
  });
}


function showDetailModal(tr) {
  const idx = $(tr).children("td:first-child").data("idx");
  const modal = $("#board_detail_modal");
  getBoardPost(idx, function (data) {
    modal.find("#userid").text(data.id);
    modal.find("#id").val(data.id);
    modal.find("#idx").val(data.idx);
    modal.find("#post_id").val(data.idx);
    modal.find("#date").text(data.date);
    modal.find("#title").text(data.title);
    modal.find("#content").text(data.content);
    if (data.orifile !== "") {
      data.orifile = data.orifile.split(" ");
      data.savefile = data.savefile.split(" ");
      data.savefile.pop();
      data.orifile.pop();
      const code = data.orifile.map((v, i) => `<div><a href="/download?filename=${data.savefile[i]}&downname=${v}" class="d-inline-block">${v}</a></div>`);
      modal.find("#file").html(code);
    }

    if (grade == 9 || id == data.id) {
      $("#btnModify").removeClass("d-none");
    } else {
      $("#btnModify").addClass("d-none");
    }
  });

  $("#detail_comment_table > tbody").empty();
    getBoardComment(idx, (data) => {
      const code = data.map(v => `<tr data-idx="${v.cmt_id}">
                                  <th class="indent-${v.indent}">
                                    <div>${v.writer}</div>
                                    <div class="text-secondary f-075 mt-1">${v.date}</div>
                                  </th>
                                  <td class="indent-${v.indent} position-relative">
                                    <p>${ !v.removed ? v.content : `<span class="f-0875 font-italic text-secondary">댓글이 삭제되었습니다.</span>`}
                                   </p>
                                   ${v.savefile !== '' ? `<a href="/upload/${v.savefile}" class="img-container"><img src="/upload/${v.savefile}" alt="" class="cmt-img"></a>` : ''}
                                   <ul class="recommand-box">
                                    <li class="pointer" onclick="recommendComment(this);">👍🏻<span class="f-0875 text-info">${v.recommended}</span></li>
                                    <li class="pointer" onclick="decommendComment(this);">👎🏻<span class="f-0875 text-secondary">${v.not_recommended}</span></li>
                                   </ul>
                                  </td>
                                  <td>
                                    <button type="button" class="btn btn-secondary btn-sm rounded-0" id="btnComment" onclick="replyComment(this);">답변</button>
                                    ${!v.removed ? id == v.writer || grade == 9 ? `<button type="button" class="btn btn-secondary btn-sm rounded-0" id="btnModify" onclick="modifyComment(this);">수정</button>` : '' : ''}
                                    ${!v.removed ? id == v.writer || grade == 9 ? `<button type="button" class="btn btn-danger btn-sm rounded-0" id="btnRemove" onclick="removeComment(this);">삭제</button>` : '' : ''}
                                  </td>
                                </tr>`);
    $("#detail_comment_table > tbody").prepend(code);
  });

  $("#board_detail_modal").modal("show");
}

function updateComment(t) {
  const comment = $(t).parent().prev("td").children("input[name='modify_cmt_input']").val();
  const post_id = $(t).parents("#board_detail_modal").find("input[name='idx']").val();
  const cmt_id = $(t).parents("tr").data("idx");

  if(comment.trim() == '') {
    alert("댓글 내용을 입력해주세요.");
    $("input[name='modify_cmt_input']").focus();
    return;
  }

  $.ajax({
    type: 'post',
    url: `/rest/update_comment`,
    data: {post_id, cmt_id, comment},
    error: function (err) {
      console.log(err);
    },
    success: function (res) {
      console.log(res);
      if(res.code == 401) {
        alert("권한이 없습니다.");
        return;
      }
      if(res.code == 200) {
        alert("댓글 수정이 완료되었습니다.");
        location.href = '/';
      }
    }
  });
}



function modifyComment(t) {
  const p = $(t).parent().prev("td").children("p");
  const comment = p.text().trim();
  const update_btn = `<button type="button" class="btn btn-info btn-sm rounded-0" id="btnUpdateComment" onclick="updateComment(this);">확인</button>`;
  const cancel_btn = `<button type="button" class="btn btn-secondary btn-sm rounded-0 ml-1" id="btnCancelModify" onclick="cancelModifyComment(this);">취소</button>`;
  const input = `<input type="text" class="form-control mb-4" name="modify_cmt_input">`;

  p.addClass("d-none");
  $(t).addClass("d-none");
  $(t).parent("td").children("#btnRemove").addClass("d-none");
  $(t).parent().prev("td").prepend(input);
  $("input[name='modify_cmt_input']").val(comment);
  $(t).parent().append(update_btn, cancel_btn);
}

function cancelModifyComment(t) {
  $(t).parent().prev("td").children("p").removeClass("d-none");
  $(t).parent("td").children("#btnRemove").removeClass("d-none");
  $(t).parent("td").children("#btnModify").removeClass("d-none");
  $(t).parent("td").children("#btnUpdateComment").remove();
  $(t).remove();
  $("input[name='modify_cmt_input']").remove();
}


function recommendComment(t) {
  if(!confirm("이 댓글을 추천하시겠습니까?")) {
    return;
  }
  else {
    const post_id = $(t).parents("#board_detail_modal").find("input[name='idx']").val();
    const cmt_id = $(t).parents("tr").data("idx");

    $.ajax({
      type: 'get',
      url: `/rest/recommend_comment/${post_id}/${cmt_id}`,
      error: function (err) {
        console.log(err);
      },
      success: function (res) {
        if(res.code == 400) {
          alert("댓글당 추천 또는 비추천은 한번만 할 수 있습니다.");
        }
        else if(res.code == 200) {
          alert("댓글을 추천했습니다.");
          location.href = '/';
        }
      }
    });
  }
}

function decommendComment(t) {
  if(!confirm("이 댓글을 비추천하시겠습니까?")) {
    return;
  }
  else {
    const post_id = $(t).parents("#board_detail_modal").find("input[name='idx']").val();
    const cmt_id = $(t).parents("tr").data("idx");

    $.ajax({
      type: 'get',
      url: `/rest/decommend_comment/${post_id}/${cmt_id}`,
      error: function (err) {
        console.log(err);
      },
      success: function (res) {
        if(res.code == 400) {
          alert("댓글당 추천 또는 비추천은 한번만 할 수 있습니다.");
        }
        else if(res.code == 200) {
         alert("댓글을 비추천했습니다.");
          location.href = '/';
        }
      }
    });
  }


}

function removeComment(t) {
  if(!confirm("정말로 댓글을 삭제하시겠습니까?")) {
    return;
  }
  else {
    const post_id = $(t).parents("#board_detail_modal").find("input[name='idx']").val();
    const cmt_id = $(t).parents("tr").data("idx");
    $.ajax({
      type: 'get',
      url: `/rest/remove_board_comment/${post_id}/${cmt_id}`,
      error: function (err) {
        console.log(err);
      },
      success: function (res) {
        if(res.code == 401) {
          alert("댓글 삭제 권한이 없습니다.");
          location.href = '/';
        }
        else if(res.code == 200) {
          alert("댓글이 삭제되었습니다.");
          location.href = '/';
        }
      }
    });
  }
};

function cancelReply(t) {
  $(t).parents("tr").prev().find("#btnComment").prop("disabled", false);
  $(t).parents("tr").remove();
}

function replyComment(t) {
  event.preventDefault();
  event.stopPropagation();
  $(t).prop("disabled", true);

  const tr = $(t).parents("tr");
  const form = `<tr>
                  <th width="100" class="f-0875">↳ ${id}</th>
                  <td>
                    <form action="/rest/write_comment" method="post" enctype="multipart/form-data" name="replyCommentForm" onsubmit="return writeComment(this);">
                      <input type="hidden" name="post_id" id="post_id">
                      <input type="hidden" name="parent_id" id="parent_id">
                      <input type="text" name="content" class="form-control rounded-0" placeholder="댓글 내용을 입력하세요.">
                      <div class="d-flex justify-content-between align-items-center" id="input_btn_group">
                        <input type="file" name="up_cmt_file" class="form-control-file py-2 w-75">
                      </div>
                    </form>
                  </td>
                  <td>
                    <button type="submit" class="btn btn-secondary btn-sm rounded-0" onclick="submitCommentForm(this);">등록</button>
                    <button type="button" class="btn btn-sm btn-secondary rounded-0" onclick="cancelReply(this);">취소</button>
                  </td>
                  </tr>`;
  tr.after(form);
}

function submitCommentForm(t) {
  $(t).parents("tr").find("form").submit();
}

function submitBoardForm() {
  const title = $("#write_table").find("input[name='title']").val();
  const content = $("#write_table").find("textarea[name='content']").val();
  const file_size = $("#write_table").find("input[name='upfile']")[0].files[0].size;

  if(file_size > size_limit) {
    alert("첨부파일은 10MB를 넘을 수 없습니다.");
  }
  if (title.trim() == '') {
    alert("제목을 입력해주세요.");
    return false;
  }
  if (content.trim() == '') {
    alert("내용을 입력해주세요.");
    return false;
  }
  return true;
}


function writeComment(form) {
  event.stopPropagation();

  const post_id = $(form).parents("#board_detail_modal").find("input[name='idx']").val();
  const content = $(form).find("input[type='text']").val();
  const cmt_file = $(form).find("input[type='file']")[0].files[0];
  let file_size = 0;
  $("input[name='post_id']").val(post_id);

  // 대댓글인 경우
  const parent_id = $(form).parents("tr").prev().data("idx");
  $("input[name='parent_id']").val(parent_id);


  if (cmt_file !== undefined) {
    file_size = cmt_file.size;
  }

  if (file_size > size_limit) {
    alert("첨부파일은 10MB를 넘을 수 없습니다.");
    return false;
  }
  if (content.trim() == '') {
    alert("댓글 내용을 입력해주세요.");
    $("#comment").focus();
    return false;
  }
  return true;
}



function getBoardList(page, callback) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'get',
      url: `/rest/get_board_list/${page}`,
      error: function (err) {
        reject(err);
      },
      success: function (res) {
        resolve(res)
      }
    })
  });
}

function getBoardPost(idx, callback) {
  $.ajax({
    type: 'get',
    url: `/rest/get_board_post/${idx}`,
    error: function (err) {
        console.log(err);
    },
    success: function (res) {
      callback(res);
    }
  });
}


function getBoardComment(idx, callback) {
  $.ajax({
    type: 'get',
    url: `/rest/get_board_comment/${idx}`,
    error: function (err) {
      console.log(err);
    },
    success: function (res) {
      callback(res);
    }
  });
}


function getMemberList(callback) {
  $.ajax({
    type: 'get',
    url: "/rest/get_member_list",
    error: function (err) {
      callback(false);
    },
    success: function (res) {
      callback(res);
    }
  });
}


function updatePassword() {
  const id = $("#id").text();
  const password = $("#password").val().trim();
  if (!getRegExp('password').test(password)) {
    alert("비빌번호는 문자 숫자 특수문자를 포함해 8~15자 이내여야 합니다.");
    return;
  }

  $.ajax({
    type: 'post',
    url: "/rest/update_member_password",
    data: {id, password},
    error: function (err) {
      console.log(err);
    },
    success: function (res) {
      if (res.code == 200) {
        alert("비밀번호가 변경되었습니다.");
        location.href = '/';
      } else {
        alert("권한이 없습니다.");
        location.href = '/';
      }
    }
  })
}

function updateGrade(btn) {
  const id = $(btn).parent().data("id");
  const grade = $(btn).parents("tr").find("#select_grade").val();

  $.ajax({
    type: 'post',
    url: "/rest/update_member_grade",
    data: {id, grade},
    error: function (err) {
      callback(false);
    },
    success: function (res) {
      if (res.code == 200) {
        alert("등급이 변경되었습니다.");
        location.href = '/';
      } else {
        alert("권한이 없습니다.");
        location.href = '/';
      }
    }
  });
}