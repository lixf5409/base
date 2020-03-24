<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<!--  定义全局变量 -->
<script type="text/javascript">
	//html
	var _htmlUrl = '${_htmlUrl }';
	//ctrl
	var _ctrlUrl = '${_ctrlUrl }';
	//tabId
	var _tabId 	 = '${_tabId }';
	var _extend1 = '${_extend1}';
	var _extend2 = '${_extend2}';
	var _extend3 = '${_extend3}';
	var _extend4 = '${_extend4}';
	var _extend5 = '${_extend5}';
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
<script type="text/javascript" src="${ctx }/static/modules/requirejs/require-debug.js"></script>
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

