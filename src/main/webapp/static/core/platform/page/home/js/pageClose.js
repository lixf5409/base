// 监听页面关闭事件
define(["jquery"], function() {

	function init() {
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串  
		var isFireFox = userAgent.indexOf("Firefox") > -1;
	    var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器  
	    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器
	    var isIE11 = userAgent.indexOf("rv:11.0") > -1; //判断是否是IE11浏览器
	    var isEdge = userAgent.indexOf("Edge") > -1 && !i-1;//是否是火狐浏览器
	    var isChrome = userAgent.indexOf("Chrome") > -1;//是否是chrome

	    function logOut() {
	    	$.ajax({
				url: getControllerPath() + "/loginOut",
				async: false
			}) 
	    }
	    
	    /*
	    function log(msg) {
	    	$.ajax({
				url: getServicePath() + "/log",
				async: false,
				data: {
					status: msg
				}
			}) 
	    }
	    */
	    
	    if (isChrome) {
	    	// onbeforeunload事件时间
	    	var _beforeUnloadTime = 0;
	    	
	    	window.onbeforeunload = function (){
	    		// 记录下onbeforeunload事件时间
	    		_beforeUnloadTime = new Date().getTime();
	    	};
	    	
	    	window.onunload = function (e){
	    		// 记录onunload事件时间
	    		var _onunloadTime = new Date().getTime();
	    		// 获取onbeforeunload和onunload事件时间差
	    		var x = _onunloadTime - _beforeUnloadTime;
	    		
	    		if(x <= 5){// 关闭
	    			logOut()
	    		}else{// 浏览器刷新
	    		}
	     	}
	    }
	
	}
	
	   
    return init;
})
