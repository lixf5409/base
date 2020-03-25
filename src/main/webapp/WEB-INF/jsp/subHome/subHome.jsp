<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%-- 页面初始化参数 --%>
<%@include file="subHome-init.jsp" %>

<!DOCTYPE html>
<html lang="en">
<head>
 	<meta http-equiv="X-UA-Compatible" content="IE=10,IE=9; IE=8; IE=7; IE=edge,chrome=1" />
	<meta charset="utf-8" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <link rel="shortcut icon" href="${ctx }/favicon.ico">
   	<title>${title }</title>

	<%-- 页面样式 --%>
	<%@include file="subHome-link.jsp" %>
     
    <!-- IE8响应式布局 兼容性js文件 -->
    <!--[if lte IE 8]>
    <script src="${ctx }/static/modules/ace/dist/js/html5shiv.min.js"></script>
    <script src="${ctx }/static/modules/ace/dist/js/respond.min.js"></script>
    <![endif]-->
</head>

<body class="no-skin" ng-controller="BodyCtrl">
	<div class="body-wrap"></div>
	
	<!-- 页面公共script相关 -->
	<%@include file="subHome-script.jsp" %>
	
	<!-- 程序逻辑入口 -->
	<script type="text/javascript">
		var subHomeCtrl = getServer() + "/static/core/page/subHome/js/subHome.js";
		
		require(["jquery", "Bootstrap"], function() {
			require(["PDGlobalDir/base","easyui"], function() {
				require([subHomeCtrl,"easyui-lang-zh_CN"], function(SubHome) {
					SubHome();
				})
			})
		})
	</script>
</body>
</html>
