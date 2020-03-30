<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@page import="javax.servlet.http.HttpServletRequest"%>
<%@page import="javax.servlet.http.HttpSession"%>
<%
	// contextPath
	String contextPath = request.getContextPath();
	pageContext.setAttribute("ctx", contextPath);

    // title
    pageContext.setAttribute("title", "中软业务流程管理平台");
    // theme
//    pageContext.setAttribute("theme", pageInfoVO.getTheme());
    // copyright
    pageContext.setAttribute("copyright", "@Copyright中国软件与技术服务股份有限公司");
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