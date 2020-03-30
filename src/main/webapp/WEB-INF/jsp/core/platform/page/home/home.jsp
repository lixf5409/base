<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%-- 页面初始化参数 --%>
<%@include file="home-init.jsp" %>

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
	<%@include file="home-link.jsp" %>
    
    <!-- IE8响应式布局 兼容性js文件 -->
    <!--[if lte IE 8]>
    <script src="${ctx }/static/core/platform/lib/ace/dist/js/html5shiv.min.js"></script>
    <script src="${ctx }/static/core/platform/lib/ace/dist/js/respond.min.js"></script>
    <![endif]-->
</head>

<body class="no-skin" ng-controller="BodyCtrl">
	<div class="body-wrap">
		<%-- body--%>
		<%@include file="home-body.jsp" %>
	</div>
		
	<%-- script--%>
	<%@include file="home-script.jsp" %>

</body>
</html>
