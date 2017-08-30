/**
 * Created by hyunhokim on 2017. 8. 28..
 */
$('head').append('<script src=\'/static/class/Color.js\'><\/script>');

var css_postit_idx = 1;
var color;

$(document).ready(function () {
    // color Class 생성
    color = new Color();

    list4Ajax();
});

// 이벤트 바인딩 함수
function postit_event_binding(last_postit) {
    last_postit
        .resizable()
        .draggable({
            opacity: 0.8
        })
        .mousedown(function () {    // mousedown 이벤트 생성
            $(this).css('z-index', css_postit_idx); // 클릭한 이미지만 z-index 증가시킴
            css_postit_idx++;   // 그러면 이미지가 겹칠경우 클릭한 것이 항상 위에 표시됨
        })
        .css('z-index', css_postit_idx);    // 생성시에 최상단으로 나오도록 설정

    last_postit.find(".plus").on("click", function () {
        create_postit();
    });

    last_postit.find(".modify").on("click", function () {
        var postit = $(this).closest(".post-it");
        postit.find(".post-it_editor").toggle();
        postit.find(".post-it_view").toggle();
        postit.find(".save").toggle();     //저장 버튼 토글
        $(this).toggle();                                       // 수정 버튼 토글

        // textarea 크기 포스트잇 크기에 맞추기
        if (postit.find(".post-it_editor textarea").height >= postit.find("content").height) {
            postit.find(".post-it_editor textarea").css({
                width: postit.width() - 10 + "px",
                height: postit.height() - 65 + "px"
            });
        } else {
            postit.find(".post-it_editor textarea").css({
                width: postit.width() - 10 + "px",
                height: postit.height() - 40 + "px"
            });
        }

        postit.find(".post-it_view").css({
            height: postit.height() - 40 + "px"
        });
    });

    last_postit.find(".remove").on("click", function () {
        // 삭제하는게 마지막 포스트잇이면 새 포스트잇 한개 추가.
        var postit_count = $(".container").children(".post-it").length;

        if (postit_count == 1) {
            create_postit();
        }

        var postit = $(this).closest(".post-it");

        remove4ajax(postit)

        postit.remove();
    });

    last_postit.find(".save").on("click", function () {
        var postit = $(this).closest(".post-it");

        $(this).toggle();                   // 저장 버튼 토글
        postit.find(".modify").toggle();    // 수정 버튼 토글
        postit.find(".post-it_editor").toggle();
        postit.find(".post-it_view").toggle();

        save4ajax(postit);

        if (postit.find(".post-it_view").height >= postit.find("content").height) {
            postit.find(".post-it_view").css({
                height: postit.height() - 65 + "px"
            });
        }
    });

    last_postit.find(".config").on("click", function () {
        var postit = $(this).closest(".post-it");

        if (postit.find(".mod_config").css("display") == 'block') {
            postit.find(".post-it_editor textarea").css({
                height: postit.height() - 40 + "px"
            });
            postit.find(".post-it_view").css({
                height: postit.height() - 40 + "px"
            });
        } else {
            postit.find(".post-it_editor textarea").css({
                height: postit.height() - 65 + "px"
            });
            postit.find(".post-it_view").css({
                height: postit.height() - 65 + "px"
            });
        }

        postit.find(".mod_config").toggle();
    });

    // 포스트잇 이동 시 저장
    last_postit.on("dragstop", function () {
        save4ajax($(this));
    });

    // 포스트잇 사이즈 변경 시 저장
    last_postit.on("resizestop", function () {
        save4ajax($(this));

        if (last_postit.find(".mod_config").css("display") == 'block') {
            last_postit.find(".mod_config").toggle();
        }

        //포스트잇 사이즈 맞춰서 textarea 사이즈도 변경
        $(this).find(".post-it_editor textarea").css({
            width: $(this).width() - 10 + "px",
            height: $(this).height() - 40 + "px"
        });

        $(this).find(".post-it_view").css({
            height: $(this).height() - 40 + "px"
        });
    });

    last_postit.find(".color-box").on("click", function () {
        color.changeColor($(this));
    });
}

// 포스트잇 생성 함수
function create_postit() {
    // 새 포스트 잇
    var new_postit = makePostit(this);

    $(".container").append(new_postit);

    var last_postit = $(".container").children(":last");

    create4ajax(last_postit);

    postit_event_binding(last_postit);
}

function save4ajax(postit) {

    var csrf = "?" + $("#csrf").attr("name") + "=" + $("#csrf").val();
    var id = postit.attr("data-id");
    var content = postit.find("#ckeditor").val();
    var pos = postit.position();
    var pos_x = pos.left;
    var pos_y = pos.top;
    var h_color = postit.find(".header").css("background-color");
    var c_color = postit.css("background-color");
    var width = postit.width();
    var height = postit.height();
    var z_idx = postit.css("z-index");

    $.ajax({
        url: "/postit/save" + csrf,
        type: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-HTTP-Method-Override": "POST"
        },
        data: JSON.stringify({
            id: id,
            content: content,
            pos_x: pos_x,
            pos_y: pos_y,
            h_color: h_color,
            c_color: c_color,
            width: width,
            height: height,
            z_idx:z_idx
        }),
        success: function () {
            // textarea로 저장된 값에서 \n을 <br> 태그로 변환
            postit.find(".post-it_view").html(content.replace(/\r\n|\r|\n/g, "<br />"));
        }
    });
}

function create4ajax(postit) {

    var csrf = "?" + $("#csrf").attr("name") + "=" + $("#csrf").val();
    var content = "";
    var pos = postit.position();
    var pos_x = pos.left;
    var pos_y = pos.top;
    var h_color = color.h_color;
    var c_color = color.c_color;

    $.ajax({
        url: "/postit/create" + csrf,
        type: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-HTTP-Method-Override": "POST"
        },
        data: JSON.stringify({
            content: content,
            pos_x: pos_x,
            pos_y: pos_y,
            h_color: h_color,
            c_color: c_color
        }),
        success: function (result) {
            postit.attr("data-id", result);
            postit.css("background-color", c_color);
            postit.find(".header").css("background-color", h_color);
        }
    });
}

function remove4ajax(postit) {

    var csrf = "?" + $("#csrf").attr("name") + "=" + $("#csrf").val();
    var id = postit.attr("data-id");

    $.ajax({
        url: "/postit/remove/" + id + csrf,
        type: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-HTTP-Method-Override": "POST"
        },
        success: function (result) {
        }
    });
}

function list4Ajax() {
    var url = "/postit/list";

    $.getJSON(url, function (data) {

        if (data.list.length < 1) {
            // 저장된 포스트잇이 한개도 없을 경우 기본 포스트잇 한개 생성
            create_postit();
        } else {

            $(data.list).each(function () {
                var postit = makePostit(this);

                $(".container").append(postit);
                var last_postit = $(".container").children(":last");
                last_postit.css({
                    "top": this.pos_y + "px",
                    "left": this.pos_x + "px",
                    "background-color": this.c_color,
                    "width": this.width,
                    "height": this.height
                });

                last_postit.find(".header").css("background-color", this.h_color);

                last_postit.find(".post-it_view").css({
                    height: this.height - 40 + "px"
                });

                last_postit.css("z-index", this.z_idx);
                css_postit_idx = this.z_idx;
                postit_event_binding(last_postit);
            });
        }
    });
}

//포스트잇 생성
function makePostit(data) {
    var postit = "";
    postit +=
        "<div class='post-it' data-id='" + ((data.id == undefined) ? '' : data.id) + "'>"
        + "<div class='header'>"
        + "<div class='content'>"
        + "<div class='plus'>"
        + "<span class='glyphicon glyphicon-plus'></span>"
        + "</div>"
        + "&nbsp"
        + "<div class='modify'>"
        + "<span class='glyphicon glyphicon-pencil'></span>"
        + "</div>"
        + "<div class='save' style='display: none;'>"
        + "<span class='glyphicon glyphicon-ok'></span>"
        + "</div>"
        + "&nbsp"
        + "<div class='config'>"
        + "<span class='glyphicon glyphicon-cog'></span>"
        + "</div>"
        + "&nbsp"
        + "<div class='remove'>"
        + "<span class='glyphicon glyphicon-remove'></span>"
        + "</div>"
        + "</div>"
        + "</div>"
        + "<div class='mod_config' style='display:none;'>"
        + "<div class='color-box orange' id='orange'>"
        + "</div>"
        + "&nbsp"
        + "<div class='color-box blue' id='blue'>"
        + "</div>"
        + "&nbsp"
        + "<div class='color-box green' id='green'>"
        + "</div>"
        + "&nbsp"
        + "<div class='color-box red' id='red'>"
        + "</div>"
        + "&nbsp"
        + "<div class='color-box gray' id='gray'>"
        + "</div>"
        + "&nbsp"
        + "</div>"
        + "<div class='content'>"
        + "<div class='post-it_editor' style='display: none;'>"
        + "<textarea name='content' id='ckeditor' cols='15' rows='5'>"
        + ((data.content == undefined) ? '' : data.content)
        + "</textarea>"
        + "</div>"
        + "<div class='post-it_view'>"
        + ((data.content == undefined) ? '' : data.content.replace(/\r\n|\r|\n/g, "<br />"))
        + "</div>"
        + "</div>";

    return postit;
}