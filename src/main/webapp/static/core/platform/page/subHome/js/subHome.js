define([
    "jqValidate-build", // 默认引入jquery-validate
	"PDCoreDir/corePath",
	"PDAppDir/appPath"
	], function () {
    
	function init() {
		initJQValidate();
		//TODO 写死的
        // _htmlUrl = "static/core/originalf/workflow/approvaltemplate/views/index.html";
        // _ctrlUrl = "static/core/originalf/workflow/approvaltemplate/approvalTemplateCtrl";
		if (_htmlUrl && _htmlUrl.length > 0 && _htmlUrl != 'null') {
			_htmlUrl = getHtmlUrl(_htmlUrl);
			
			$.ajax({
				url: _htmlUrl,
                type: "GET",
				dataType: "text",
				success: function(html) {
					//$(".body-wrap").html(html);
					
					if (_ctrlUrl && _ctrlUrl.length > 0 && _ctrlUrl != 'null') {
						require([_ctrlUrl], function(Ctrl){
							$(".body-wrap").html(html);
							Ctrl(_extend1, _extend2, _extend3, _extend4, _extend5);
						})
					} else {
						$(".body-wrap").html(html);
					}
				}
			})
		}
	}
	
	function getHtmlUrl(url) {
		var context = getServer();
		context = context || "/";

		if (context == "/") {
			if (url.indexOf("/") != 0) {
				url = "/" + url;
			}
		} else {
			if (url.indexOf(context) != 0) {
				if (url.indexOf("/") != 0) {
					url = context + "/" + url;
				} else {
					url = context + url;
				}
			}
		}
		
		return url;
	}
	
	/*
     * 全局表单验证
     */
	function initJQValidate() {
		$.validator.setDefaults({
			errorElement : 'span',
			errorClass : 'cs-help-block',
			highlight : function(target) {
				var fg =  $(target).closest('.form-group');
				//直接是输入框时，修改输入框的边框样式，比如table中的输入框验证
				fg.length ? fg.addClass('has-error') : $(target).addClass('cs-error-border');
			},
			success : function(message) {
				var fg =  message.closest('.form-group');
				fg.length ? fg.removeClass('has-error') : message.prev().removeClass('cs-error-border');
				message.remove();
			}
		});
	}

	return init;
});