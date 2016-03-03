$(document).ready(function() {
	var resizeEditorPreview = false;
	
	$(".resize-editor-preview").mousedown(function() {
		resizeEditorPreview = true;
	}, function() {
		resizeEditorPreview = false;
	});
	
	$(".resize-editor-preview").mousemove(function(event) {
		console.log("a");
		if(resizeEditorPreview) {
			console.log("test");
		}
	});
});