<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<!--  定义全局变量 -->
<script type="text/javascript">
	// 欢迎页参数
    var _welcomeHtml = '${welcomeHtml }';
	var _welcomeCtrl = '${welcomeCtrl }';
	var _welcomeOpen = '${welcomeOpen }';

</script>

<!-- 定义全局方法-->
<script type="text/javascript">
	var console = console || {log : function(){}};
	function getServer() {
	    return '${ctx }';
	}
	function getServicePath(){
		return getServer()+"/resoft";
	}
	function getControllerPath(){
		return getServer()+"/resoftCtrl";
	}
	function getStaticPath() {
		return getServer() + "/static";
	}
	function getCSRFToken() {
	   return "${sessionScope.CSRFToken}";
    }
	
</script>

<!-- 引入requireJS -->
<script type="text/javascript" src="${ctx }/static/modules/requirejs/require.js"></script>
<!-- 引入require.config.js -->
<script type="text/javascript" src="${ctx }/static/global/config.js"></script>
<!-- 定义requireJs全局配置 -->
<script type="text/javascript">
	var baseUrl = getServer() || "/";
	require.config({
		baseUrl : baseUrl/* ,
		paths : {
			"jquery":"static/modules/jquery/jquery-2.1.3.min"
		} */
	})
</script>
<!-- jQuery IE Version 8(hack) -->
<!--[if IE]>
<script type="text/javascript">
    require.config({
    	paths:{
    		"jquery":"static/modules/jquery/jquery1x.min"
   		}
	});
</script>
<![endif]-->

<!-- 程序入口 -->
<script type="text/javascript">
	var homeCtrl = getServer() + "/static/core/page/home/js/home.js";
	
	require(["jquery", "Bootstrap"], function() {
		require(["PDGlobalDir/base"], function() {
			require([homeCtrl], function(Home) {
				Home();
			})
		})
	})
</script>
