window.$ = require("./js/jquery-2.2.1.min.js");

$(document).ready(function() {
	var resizeEditorPreview = false;
	
	$(".resize-editor-preview").mousedown(function() {
		resizeEditorPreview = true;
	});
	
	$("#top-section").mouseup(function() {
		resizeEditorPreview = false;
		$("#top-section").css("cursor", "default");
	});
	
	/*$(".resize-editor-preview").mouseleave(function() {
		resizeEditorPreview = false;
	});*/
	
	$("#top-section").mousemove(function(event) {
		if(resizeEditorPreview) {
			$("#top-section").css("cursor", "ew-resize");
			var percent = event.clientX/window.innerWidth;
			
			if(percent < 0.9 && percent > 0.1) {
				$("#editor").css("right", (1 - percent)*100 + "%");
				$("#preview").css("left", percent*100 + "%");
			}
		}
	});
});