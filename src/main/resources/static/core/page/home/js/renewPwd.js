define(["jquery"], function() {
	
	function init() {
		require(["PDUtilDir/dialog"],function (Dialog) {
	        var dialog = Dialog({
	            id : "RenewPwdDialog",
	            title : "更新密码",
	            width : "500px",
	            height : "465px",
	            defaultClose : false, // 不显示关闭按钮
	            modal : {
	                backdrop : "static" // 遮罩层不可关闭
	            },
	            dialogSize : "modal-sm ", // modal-lg或modal-sm
	            body : "加载中",
	            afterOpen: function() {
	            	
	            	var html = 'static/core/system/profile/views/modifyPasswd.html';
	        		var ctrl = 'static/core/system/profile/modifyPasswdCtrl';
	            	
	            	var paramArr = [];
	            	paramArr.push("tabId=RenewPwd");
	            	paramArr.push("html=" + encodeURIComponent(html));
	            	paramArr.push("ctrl=" + encodeURIComponent(ctrl));
					
	            	var url = getServicePath() + "/page";
					url = url + "?" + paramArr.join("&");
	            	
	            	dialog.setBody(
	            			'<iframe' +
	            			' id="loginFrame" src="' + url + '"' +
	            			' frameborder="0" scrolling="yes" height="98%" width="100%"' +
	            	'></iframe>');
	            	
	            }
	        });
	        
	        // 设置弹出框样式
	        $("#RenewPwdDialog .modal-header .close").remove();
	
	        //dialog.show();
	    });
	}
	
	
	return init;
})