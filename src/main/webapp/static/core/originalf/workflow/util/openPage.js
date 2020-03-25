define(["jquery","PDUtilDir/tool","PDUtilDir/util","static/core/originalf/workflow/service/wfmUtils","static/core/originalf/workflow/util/langUtils", "text!static/core/originalf/workflow/app/lang/app.json"],function($,Tool,Util,WfmUtils,LangUtils, AppLang){
	var lang = LangUtils.getLocaleObject(AppLang);
    var getApplicationServerUrl = function(){
		return getServicePath() + "/wfm/ApplicationServiceContainer/";
	};
    var openStartTaskPage = function(opts) {
    	$.ajax({
    		url:getApplicationServerUrl()+"getConfigForStart",
    		//type:"post",
    		//async: false,
    		data:{configCode:opts.data.configCode},
    		success:function(resMap){
                var config = resMap.config;
                var inputActivity = resMap.inputActivity;
    			if(config){
    				if(config.state==1){//配置完成
                        if(!inputActivity||inputActivity.flag!=true) {
                            Util.alert("请检查流程活动配置，主流程有且仅能有一个录入环节");
                        }else{//有录入环节
                            var data = {};
                            data.configCode = opts.data.configCode;
                            data.configId = inputActivity.configId;
                            data.proDirId = inputActivity.proDirId;
                            data.actDefId = inputActivity.actDefId;
                            if(!WfmUtils.isEmpty(opts.callback)){
                                opts.callback( $.extend(opts.data,data));
                            }
                        }
    				} else {
    					Util.alert("配置未完成，不能启动");
    				}
    			} else {
    				Util.alert("未查到配置信息，不能启动");
        		}
        	}
        });
    };
    var openDraftTaskPage = function(opts) {
        var wfmData = opts.data;
        //获取录入环节actDefId
        $.ajax({
            url:getApplicationServerUrl()+"getConfigForDraft",
            //type:"post",
            async: false,
            data:{configId:wfmData.configId,proDirId:wfmData.proDirId},
            success:function(resMap) {
                var data = {};
                data.actDefId = resMap.actDefId;
                if (!WfmUtils.isEmpty(opts.callback)) {
                    opts.callback($.extend(opts.data, data));
                }
            }
        });
    };
    var closetab = function(){
		if(window!=null){
			var wfmData = Tool.serialize("wfmDataForm");
			 $.ajax({
		            url: getServicePath() + "/wfm/ApplicationServiceContainer/getBizMainJS",
		            data: {
		            	proDirId: wfmData.proDirId,
		                configId: wfmData.configId
		            },
		            async: false,
		            success: function (data) {
		            	window.doRefreshForWF(data.doRefreshJS,wfmData.doRefreshParam);
		            }
		      });
		}
	};
    var openEndTaskPage = function(opts){
        var wfmData = opts.data;
        var userId = wfmData.userId;
        var configId = wfmData.configId;
        var proDirId = wfmData.proDirId;
        var proInstId = wfmData.proInstId;
        var bizId = wfmData.bizId;
        var doRefreshJS = wfmData.doRefreshJS;
        var doRefreshParam = wfmData.doRefreshParam;
        if(wfmData.isCheckRoleType==undefined){
        	wfmData.isCheckRoleType = true;
        }
        var isCheckRoleType = wfmData.isCheckRoleType;
        var type = wfmData.type;
        //如果调用接口时传递了wfmRoleTypes则以传入的为准，否则去后台查询一下。
        var wfmRoleTypes = wfmData.wfmRoleTypes;
        if(wfmRoleTypes && wfmRoleTypes.length>0){
            if(!WfmUtils.isEmpty(opts.callback)){
                opts.callback(wfmData);
            }
        } else {
            $.ajax({
                url: getServicePath() + "/wfm/ApplicationServiceContainer/listRoleTypes",
                data: {
                    userId:userId,
                    proInstId: proInstId,
                    configId:configId
                },
                async: false,
                success: function (data) {
                    wfmRoleTypes = data.wfmRoleTypes;
                    wfmData.wfmRoleTypes = wfmRoleTypes;
                    if(isCheckRoleType && (wfmRoleTypes==null||wfmRoleTypes=="")){
                    	var data = {configId:configId, proDirId:proDirId,doRefreshParam:doRefreshParam};
                        Tool.deserialize("wfmDataForm",data);
                    	Util.alert(lang.unauthorizedWorkitem,closetab);
                        return;
                    } else{
                        if(!WfmUtils.isEmpty(opts.callback)){
                            opts.callback(wfmData);
                        }
                    }
                }
            });
        }
    };
    var openRunningTaskPage = function(opts) {
        var wfmData = opts.data;
        var userId = wfmData.userId;
        var configId = wfmData.configId;
        var proDirId = wfmData.proDirId;
        var actDefId = wfmData.actDefId;
        var proInstId = wfmData.proInstId;
        var actInstId = wfmData.actInstId;
        var workitemId = wfmData.workitemId;
        var bizId = wfmData.bizId;
        var doRefreshJS = wfmData.doRefreshJS;
        var doRefreshParam = wfmData.doRefreshParam;
        if(wfmData.isCheckRoleType==undefined){
        	wfmData.isCheckRoleType = true;
        } 
        var isCheckRoleType = wfmData.isCheckRoleType;
        var type = wfmData.type;
        //如果调用接口时传递了wfmRoleTypes则以传入的为准，否则去后台查询一下。
        var wfmRoleTypes = wfmData.wfmRoleTypes;
        var isExistRoleTypes = false;//判断是否传递了权限
        if(wfmRoleTypes && wfmRoleTypes.length>0){
        	isExistRoleTypes = true;
        }
        
        if (actInstId == "" || actInstId == null) {//审批中和我的申请已完成的同步子流程、消息中心的消息、消息中心已办列表
            $.ajax({
                url: getServicePath() + "/wfm/ApplicationServiceContainer/getRoleTypesAndActInst",
                data: {
                    userId:userId,
                    proInstId:proInstId,
                    configId:configId
                },
                async: false,
                success: function (data) {
                    if (data && data.actInstList.length > 0) {
                        var actInstList = data.actInstList;
                        if (actInstList.length == 1) {
                            actInstId = actInstList[0].actInstId;
                            actDefId = actInstList[0].actDefId;
                            
                            if(!isExistRoleTypes){
                                wfmRoleTypes = actInstList[0].wfmRoleTypes;
                                if(isCheckRoleType && (wfmRoleTypes==null||wfmRoleTypes=="")){
                                	 var data = {configId:configId, proDirId:proDirId,doRefreshParam:doRefreshParam};
                                     Tool.deserialize("wfmDataForm",data);
                                	 Util.alert(lang.unauthorizedWorkitem,closetab);
                                	 return;
                                }
                            }
                            if(!WfmUtils.isEmpty(opts.callback)){
                                opts.callback( {
                                    configId:configId,
                                    proDirId:proDirId,
                                    actDefId:actDefId,
                                    wfmRoleTypes:wfmRoleTypes,
                                    proInstId:proInstId,
                                    actInstId:actInstId,
                                    workitemId:workitemId,
                                    bizId:bizId,
                                    doRefreshJS:doRefreshJS,
                                    doRefreshParam:doRefreshParam,
                                    type:type
                                });
                            }
                        } else {//根据流程实例去查询，如果多个，返回前台，选择
                            var bodyHTML = "";
                            for (var i = 0; i < actInstList.length; i++) {
                                var selectActInstId = actInstList[i].actInstId;
                                var selectActDefId = actInstList[i].actDefId;
                                var selectActDefName = actInstList[i].actDefName;
                                wfmRoleTypes = isExistRoleTypes?wfmRoleTypes:actInstList[i].wfmRoleTypes;
                                bodyHTML += "<label class='radio-inline'><input type='radio' name='wfmOpenActivity' value='" + selectActInstId + ";" + selectActDefId + ";" + wfmRoleTypes+"' > " + selectActDefName + "</label><br/>";
                            }
                            showOpenActivityDialog(bodyHTML,configId,proDirId,proInstId,workitemId,bizId,doRefreshJS,doRefreshParam,type,opts,isCheckRoleType);
                        }
                    } else {
                        Util.alert(lang.getActInstFailed);
                        return;
                    }
                }
            });
        } else {
            $.ajax({
                url: getServicePath() + "/wfm/ApplicationServiceContainer/getRoleTypesAndActInstBeforeSubflow",
                data: {
                    userId:userId,
                	proInstId:proInstId,
                	configId:configId,
                    actInstId: actInstId
                },
                async: false,
                success: function (data) {
                    if(data){
                        if (data.actInstList){
                            var actInstList = data.actInstList;
                            if (actInstList.length == 1) {
                                actInstId = actInstList[0].actInstId;
                                actDefId = actInstList[0].actDefId;
                                
                                if(!isExistRoleTypes){
                                    wfmRoleTypes = actInstList[0].wfmRoleTypes;
                                    if(isCheckRoleType && (wfmRoleTypes==null||wfmRoleTypes=="")){
                                    	var data = {configId:configId, proDirId:proDirId,doRefreshParam:doRefreshParam};
                                        Tool.deserialize("wfmDataForm",data);
                                    	Util.alert(lang.unauthorizedWorkitem,closetab);
                                        return;
                                    }
                                }

                                if(!WfmUtils.isEmpty(opts.callback)){
                                    opts.callback( {
                                        configId:configId,
                                        proDirId:proDirId,
                                        actDefId:actDefId,
                                        wfmRoleTypes:wfmRoleTypes,
                                        proInstId:proInstId,
                                        actInstId:actInstId,
                                        workitemId:workitemId,
                                        bizId:bizId,
                                        doRefreshJS:doRefreshJS,
                                        doRefreshParam:doRefreshParam,
                                        type:type
                                    });
                                }
                            } else {//根据流程实例去查询，如果多个，返回前台，选择
                                var bodyHTML = "";
                                for (var i = 0; i < actInstList.length; i++) {
                                    var selectActInstId = actInstList[i].actInstId;
                                    var selectActDefId = actInstList[i].actDefId;
                                    var selectActDefName = actInstList[i].actDefName;
                                    wfmRoleTypes = isExistRoleTypes?wfmRoleTypes:actInstList[i].wfmRoleTypes;
                                    bodyHTML += "<label class='radio-inline'><input type='radio' name='wfmOpenActivity' value='" + selectActInstId + ";" + selectActDefId + ";" + wfmRoleTypes+"' > " + selectActDefName + "</label><br/>";
                                }
                                showOpenActivityDialog(bodyHTML,configId,proDirId,proInstId,workitemId,bizId,doRefreshJS,doRefreshParam,type,opts,isCheckRoleType);
                            }
                        }else{
                            Util.alert(data.message);
                            return;
                        }
                    }
                }
            });
        }
    };



    var showOpenActivityDialog= function(bodyHTML,configId,proDirId,proInstId,workitemId,bizId,doRefreshJS,doRefreshParam,type,opts,isCheckRoleType){
        require(["PDUtilDir/dialog"],function(Dialog){
            //为弹出框增加操作按钮
            var buttons = [];
            buttons.push(
                {name:"确定",callback:function(){
                    var selectAct = $("input[name='wfmOpenActivity']:checked").val();
                    if(selectAct == null || selectAct == ""){
                        Util.alert(lang.selectActivityTips);
                        return;
                    }
                    var actInstId = selectAct.split(";")[0];
                    var actDefId = selectAct.split(";")[1];
                    var wfmRoleTypes = selectAct.split(";")[2];
                    if(isCheckRoleType && (wfmRoleTypes==null||wfmRoleTypes=="")){
                    	var data = {configId:configId, proDirId:proDirId,doRefreshParam:doRefreshParam};
                        Tool.deserialize("wfmDataForm",data);
                    	Util.alert(lang.unauthorizedWorkitem,closetab);
                    	return;
                    }
                    dialog.hide();
                    if(!WfmUtils.isEmpty(opts.callback)){
                        opts.callback({configId:configId,
                            proDirId:proDirId,
                            actDefId:actDefId,
                            wfmRoleTypes:wfmRoleTypes,
                            proInstId:proInstId,
                            actInstId:actInstId,
                            workitemId:workitemId,
                            bizId:bizId,
                            doRefreshJS:doRefreshJS,
                            doRefreshParam:doRefreshParam,
                            type:type
                        });
                    }
                }
                });
            var dialog = Dialog({
                id:"showOpenActivityDialogId",
                cache:false,                 //是否缓存，默认为true
                title:lang.selectActivityTitle,
                width:"400px",
                height:"100px",
                dialogSize:"",
                body:"窗口中间内容",
                buttons:buttons
            });
            dialog.setBody(bodyHTML);
            dialog.show();
        });
    };

    var clearWfmDataForm = function(){
        var data = {configId:null, configCode:null, proDirId:null, actDefId:null, wfmRoleTypes:null, proInstId:null, actInstId:null, workitemId:null, bizId:null, wfmInitPageType:null};
        Tool.deserialize("wfmDataForm",data);
    };
    
    var openInfoPreview = function(proInstId,bizId,flag,infoContentCkeditor,configCode,ntkoContent){
    	if(flag=="preview"){
    		var data = {proInstId:proInstId, bizId:bizId, wfmInitPageType:"previewInfo"};
    		Tool.deserialize("wfm_information_publisher",data);
    		$("#infoContentCkeditor").val(infoContentCkeditor);
    		$("#ntkoContent").val(ntkoContent);
            $("#wfm_information_publisher").submit();
    	} else {
    		var data = {proInstId:proInstId, bizId:bizId, configCode:configCode,wfmInitPageType:"infoPublish"};
    		Tool.deserialize("wfmDataForm",data);
            $("#wfmDataForm").submit();
    	}
    }
    
    var openInfoPublishForHome = function(type){
    	var data = {wfmExtendData:type, wfmInitPageType:"infoPublishForHome"};
    	Tool.deserialize("wfmDataForm",data);
        $("#wfmDataForm").submit();

    }
    
    return {
        openStartTaskPage:openStartTaskPage,
        openDraftTaskPage:openDraftTaskPage,
        openEndTaskPage:openEndTaskPage,
        openRunningTaskPage:openRunningTaskPage,
        openInfoPreview:openInfoPreview,
        openInfoPublishForHome:openInfoPublishForHome

    };
});