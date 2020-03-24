<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="javax.servlet.http.HttpServletRequest"%>
<%@page import="javax.servlet.http.HttpSession"%>
<%
	// contextPath
	String contextPath = request.getContextPath();
	pageContext.setAttribute("ctx", contextPath);

    // title
    pageContext.setAttribute("title", "base测试");
    // theme
//    pageContext.setAttribute("theme", pageInfoVO.getTheme());
    // copyright
    pageContext.setAttribute("copyright", "中国软件");
    // welcome
		/*
		pageContext.setAttribute("welcomeHtml", pageInfoVO.getWelcomeHtml());
		pageContext.setAttribute("welcomeCtrl", pageInfoVO.getWelcomeCtrl());
		pageContext.setAttribute("welcomeOpen", pageInfoVO.getWelcomeOpen());
		*/
//    pageContext.setAttribute("welcomeHtml", LoginConfig.getWELCOME_HTML());
//    pageContext.setAttribute("welcomeCtrl", LoginConfig.getWELCOME_CTRL());
//    pageContext.setAttribute("welcomeOpen", LoginConfig.getWELCOME_OPEN());
    // 快捷菜单启用
//    pageContext.setAttribute("shortcutEnable", String.valueOf(false));
%>