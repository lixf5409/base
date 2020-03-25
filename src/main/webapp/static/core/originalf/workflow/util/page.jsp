<%@ page contentType="text/html; charset=UTF-8" language="java" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<c:set var="ctx" value="${pageContext.request.contextPath}"/>

<!DOCTYPE html>
<html>
    <head lang="en">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <%--    <meta charset="utf-8" />
      --%>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <title></title>
        <%@include file ="/static/core/originalf/workflow/util/wfmSubHome.jsp"%>
        <link rel="shortcut icon" href="${ctx }/favicon.ico">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <link rel="stylesheet" href="${ctx }/static/core/originalf/workflow/style/form.css"/>
        <link rel="stylesheet" href="${ctx }/static/app/app.css"/>
        <style>
            .cs-help-block {
                display: block;
                margin-top: 5px;
                color: #a94442;
            }
            ul{
                padding:0px
            }
            li{
                list-style: none;
            }
            .disabled{
    			position: relative;
    		}
    		.disabled .a{
    			position: absolute;
    			left: 0;
    			top: 0;
    			right: 0;
    			bottom: 0;
    			background: #fff;
    			opacity: .3;
    			filter: alpha(opacity=30);
   		 	}
        </style>
        <title></title>
    </head>
    <body>
        <%-- <jsp:include  page='/static/core/originalf/demo/ccsq/views/form.html'/> --%>
        <%--<jsp:include  page='<%= "/"+request.getParameter("t") %>'/>--%>
        <div id="showWebEditor"></div>
        <div id="wfmHtml"></div>
        <div id="message"></div>
        <div id="infoPublishForHome"></div>
    <!-- 程序入口 -->
    <script type="text/javascript">
        <%--require(['<%=request.getParameter("appMain") %>','jquery'], function (app) {--%>
            <%--app.init('<%=request.getParameter("uuid") %>');--%>
        <%--});--%>
        var userId = '<%=request.getAttribute("userId")%>';
        var configId = '<%=request.getAttribute("configId")%>';
        var configCode = '<%=request.getAttribute("configCode")%>';
        var proDirId = '<%=request.getAttribute("proDirId")%>';
        var actDefId = '<%=request.getAttribute("actDefId")%>';
        var wfmRoleTypes = '<%=request.getAttribute("wfmRoleTypes")%>';
        var proInstId = '<%=request.getAttribute("proInstId")%>';
        var actInstId = '<%=request.getAttribute("actInstId")%>';
        var workitemId = '<%=request.getAttribute("workitemId")%>';
        var wfmInitPageType = '<%=request.getAttribute("wfmInitPageType")%>';
        var bizId = '<%=request.getAttribute("bizId")%>';
        var doRefreshJS = '<%=request.getAttribute("doRefreshJS")%>';
        var doRefreshParam = '<%=request.getAttribute("doRefreshParam")%>';
        var proDefName = '<%=request.getAttribute("proDefName")%>';
        var dirId = '<%=request.getAttribute("dirId")%>';
        var version = '<%=request.getAttribute("version")%>';
		var wfmExtendData = '<%=request.getAttribute("wfmExtendData")%>';
		var wfmOpenType = '<%=request.getAttribute("wfmOpenType")%>';
		var wfmTabId = '<%=request.getAttribute("wfmTabId")%>';
		var wfmTabTitle = '<%=request.getAttribute("wfmTabTitle")%>';
        window.__jsessionId = '<%=session.getId()%>';
		var lang = {};
        if(wfmInitPageType==null||wfmInitPageType==""||wfmInitPageType=="null"){
        	require(["PDUtilDir/util",
                "static/core/originalf/workflow/util/langUtils", "text!static/core/originalf/workflow/app/lang/app.json"],function(Util,LangUtils, AppLang){
                lang = LangUtils.getLocaleObject(AppLang);
        	    var closetab = function(){
					window.opener=null;
					window.open("", "_self");
					window.close();
				};
				Util.alert(lang.doNotSubmitTheFormRepeatedly,closetab);
        	});
        }else{
	        require(["PDGlobalDir/base","PDAppDir/appPath",
                "static/core/originalf/workflow/util/langUtils", "text!static/core/originalf/workflow/app/lang/app.json"],function(base,AppPath, LangUtils, AppLang){
                lang = LangUtils.getLocaleObject(AppLang);
	            if(wfmInitPageType=="view"){
                    document.title = lang.viewProcess;
		            require(["static/core/originalf/workflow/service/appService","static/core/originalf/workflow/app/viewSupport"],function(AppService,view){
		                AppService.initWfmHtml("wfmHtml");
		                $("#wfmAppContent").show();
	                    view.showProcessImage(proInstId,proDirId,proDefName,version);
	                });
	            }else if(wfmInitPageType=="webeditor"){
	            	$("body").css("padding-top","0px");

                    document.title = lang.wfmWebEditor;
	                require(["static/core/originalf/webeditor/flex/swfobject"],function(swfObject){
	                    var swf = "<div id='flashContent'></div>";

	                    $("#showWebEditor").html(swf);
	
	                    var swfVersionStr = "10.0.0";
	                    var xiSwfUrlStr = "playerProductInstall.swf";
	                    var flashvars = {dirId:dirId};
	                    var params = {};
	                    params.quality = "high";
	                    params.bgcolor = "#ffffff";
	                    params.allowscriptaccess = "sameDomain";
	                    params.allowfullscreen = "true";
	                    var attributes = {};
	                    attributes.id = "OriginalFWebEditor";
	                    attributes.name = "OriginalFWebEditor";
	                    attributes.align = "middle";
	                    swfobject.embedSWF(
	                        getServer()+"/static/core/originalf/webeditor/flex/OriginalFWebEditor.swf", "flashContent",
	                        "100%", $(window).height() +"px",
	                        swfVersionStr, xiSwfUrlStr,
	                        flashvars, params, attributes);
	                    swfobject.createCSS("#flashContent", "display:block;text-align:left;");
	
	
	                });
	            }else if(wfmInitPageType=="infoPublish"){
                    document.title = lang.infoPublish;
	  	            require(["static/core/originalf/workflow/service/appService","static/core/originalf/workflow/infoPublish/infoPublishSupport"],function(AppService,infoPublish){
	  	                AppService.initWfmHtml("wfmHtml");
	  	              	infoPublish.previewInfo( proInstId,bizId,"","",configCode);
	                  });
	       		}else if(wfmInitPageType=="infoPublishForHome"){
                    document.title = lang.infoPublishForHome;
	  	            require(["static/core/originalf/workflow/infoPublish/infoPublishColumnSupport"],function(infoPublishColumnSupport){
	  	              	infoPublishColumnSupport.init(wfmExtendData);
	                  });
	       		}else if(wfmInitPageType=="message"){
                    document.title = lang.message;
	       			require(["static/core/originalf/workflow/service/appService","text!static/core/originalf/workflow/message/views/message.html"],function (appService,data) {
	       		    	$("#message").html(data);
	       		        require(["static/core/originalf/workflow/message/messageSupport"],function(msgSupport){
	       		            msgSupport.init(wfmExtendData);
	       		        });
	       			});
	       		}else if(wfmInitPageType=="synchEditor"){
                    document.title = lang.synchEditor;
                    require(["static/core/originalf/workflow/service/appService","static/core/originalf/workflow/synch/editor/synchEditor"],function(AppService,synchEditor){
                        AppService.initWfmHtml("wfmHtml");
                        synchEditor.showSynchEditor(proInstId,wfmExtendData);
                    });
                }else{
                    document.title = wfmTabTitle;
                    //$("title").html(wfmTabTitle);
	                require(["static/core/originalf/workflow/service/appService","static/core/originalf/workflow/app/operationSupport"],function(appService,operation){
	                	appService.initWfmHtml("wfmHtml",true);
	                	$("#wfmOpenType").val(wfmOpenType);
	                	$("#wfmTabId").val(wfmTabId);
                        $("#wfmInitPageType").val(wfmInitPageType);
                        $("#wfmExtendData").val(wfmExtendData);
	                    if(wfmInitPageType == 'start'){//拟稿
	                        operation.initOperations(null,"drafter",{
	                            userId:userId,
                                configCode:configCode,
                                configId :configId,
                                proDirId :proDirId,
                                actDefId :actDefId,
                                doRefreshJS :doRefreshJS,
                                doRefreshParam:doRefreshParam,
                                wfmRoleTypes:"drafter"
                            });
	                    }else if(wfmInitPageType == 'draft'){//草稿
	                    	operation.initOperations(bizId,"drafter",{
                                userId:userId,
                                configCode:configCode,
                                configId :configId,
                                proDirId :proDirId,
                                actDefId :actDefId,
                                proInstId :proInstId,
                                bizId :bizId,
                                doRefreshJS :doRefreshJS,
                                doRefreshParam:doRefreshParam,
                                wfmRoleTypes:"drafter"
                            });
							
						}else if(wfmInitPageType == 'end'){//完成
							operation.initOperations(bizId,"END",{
                                userId:userId,
                                configId:configId,
                                proDirId:proDirId,
                                wfmRoleTypes:wfmRoleTypes,
                                proInstId:proInstId,
                                bizId:bizId,
                                doRefreshJS:doRefreshJS,
                                doRefreshParam:doRefreshParam,
                                actDefId:actDefId
                            });
	                    }else{//运行
	                    	operation.initOperations(bizId,null,{
                                userId:userId,
                                configId:configId,
                                proDirId:proDirId,
                                actDefId:actDefId,
                                wfmRoleTypes:wfmRoleTypes,
                                proInstId:proInstId,
                                actInstId:actInstId,
                                workitemId:workitemId,
                                bizId:bizId,
                                doRefreshJS:doRefreshJS,
                                doRefreshParam:doRefreshParam
                            });
	                    }
	                });
	            }
	            /**
	            * 修复弹出对话框时，toolbar偏移的问题
	            */
	            (function(){
	                var oldSSB = $.fn.modal.Constructor.prototype.setScrollbar;
	                $.fn.modal.Constructor.prototype.setScrollbar = function (){
	                    oldSSB.apply(this);
	                    if(this.bodyIsOverflowing && this.scrollbarWidth){
	                        $('.pd-form-toolbar').css('padding-right', this.scrollbarWidth);
	                        $('#wfmAppContent').css('padding-right', this.scrollbarWidth);
	                        
	                    }
	                };
	                var oldRSB = $.fn.modal.Constructor.prototype.resetScrollbar;
	                $.fn.modal.Constructor.prototype.resetScrollbar = function (){
	                    oldRSB.apply(this);
	                    $('.pd-form-toolbar').css('padding-right', '');
	                    $('#wfmAppContent').css('padding-right', '');
	                }
	            })();
	        });
        }
    </script>
    </body>
</html>
