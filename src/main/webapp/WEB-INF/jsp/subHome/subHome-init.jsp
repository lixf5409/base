<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="javax.servlet.http.HttpServletRequest"%>
<%@page import="javax.servlet.http.HttpSession"%>
<%@page import="java.net.URLDecoder"%>
<%
	// 获取contextPath
	String contextPath = ((HttpServletRequest)pageContext.getRequest()).getContextPath();
	// 将contextPath放入pageContext中
	pageContext.setAttribute("ctx", contextPath);
	
	//设置title
	String title = (request.getParameter("title")==null?"":request.getParameter("title"));
	pageContext.setAttribute("title", "测试");
	
	String html = request.getParameter("html");
	if (html != null) {
		// 先解码
		html = URLDecoder.decode(html, "UTF-8");
		// 安全过滤
		pageContext.setAttribute("_htmlUrl", html);
	}
	
	String ctrl = request.getParameter("ctrl");
	if (ctrl != null) {
		// 先解码
		ctrl = URLDecoder.decode(ctrl, "UTF-8");
		// 安全过滤
		pageContext.setAttribute("_ctrlUrl", ctrl);
	}

	String tabId = request.getParameter("tabId");
	if (tabId != null) {
		// 先解码
		tabId = URLDecoder.decode(tabId, "UTF-8");
		// 安全过滤
		pageContext.setAttribute("_tabId", tabId);
	}

%>