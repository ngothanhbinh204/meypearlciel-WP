$(document).ready(function () {
	clickReplyComment();
	$("#commentform").validate({
		rules: {
			author: {
				required: true,
			},
			comment: {
				required: true,
			},
			email: {
				required: true,
				email: true,
			},
		},
		messages: {
			author: {
				required: "Bắt buộc nhập họ tên",
			},
			comment: {
				required: "Bắt buộc nhập bình luận",
			},
			email: {
				required: "Bắt buộc nhập email",
				email: "Hãy nhập email đúng định dạng",
			},
		},
	});
});
function clickReplyComment() {
	$(".comment-reply-link").on("click", function () {
		let idComment = $(this).data("commentid");
		$(".form-submit #comment_parent").val(idComment);
		$("html, body").animate(
			{
				scrollTop: $("#commentform").offset().top,
			},
			"slow"
		);
		$("#comment").focus();
	});
}
