define(["PDUtilDir/grid",
	"PDUtilDir/util",
	"PDUtilDir/tool",
    "static/core/originalf/workflow/util/langUtils",
    "text!static/core/originalf/workflow/lang/common.json",
    "text!static/core/originalf/workflow/approvaltemplate/lang/approvaltemplate.json",
	"ZTree",
	"css!ZTreeCss"],function(Grid,Util,Tool,LangUtil,CommonLang,Lang){

    var commonLang = LangUtil.getLocaleObject(CommonLang);
    var lang = LangUtil.getLocaleObject(Lang);
    var sysPath =  getServer() + "/static/core/originalf/workflow";

    var approvalTemplateHtml = sysPath + "/approvaltemplate/views/approvalTemplate"+LangUtil.getWfmLangFileSuffix()+".html";
	var getApprovalTemplateServerUrl = function(){
		return getServer() + "/wfm/ApprovalTemplateController/";
	};
	/**
	 * 页面初始化
	 */
	var init = function(){
	    // alert("init approval template");
		//初始化列表
		createApprovalTemplateGrid();
	};

	//创建审批意见表格
	var createApprovalTemplateGrid = function() {
		var approvalTemplate = Grid({
			id:"approvalTemplateGird",                       //用于缓存的ID
			placeAt:"approvalTemplateGird",            //存放Grid的容器ID
			pageSize:10,                         //一页多少条数据
			//title:'常用审批意见模板列表',
			hidden:false,                       //表格是否可隐藏，只显示标题
			multi:true,                   //首列为单选[radio]还是多选[checkbox],默认checkbox
			pagination : true,                  //默认分页,
			//cache:false,
			layout:[
				{name:"审批意见",field:"opinion",style:"width:80%",
					click:function(e){	editApprovalTemplate(e.data.row)}
				},
				{name:"顺序号",field:"sort",style:"width:20%"}
			],
			toolbar:[
				{name:"添加",icon:"fa fa-plus-circle",callback:registerNewButton},
				{name:"删除",icon:"fa fa-trash-o",callback:registerDelButton}
			],
			data:{
				"type":"URL",
				"value":getApprovalTemplateServerUrl() + "listApprovalTemplates"
			},
			queryParam:{
				type:"user",
				opinion:$("#opinion").val()||null
			}
		});
		Grid.init(approvalTemplate);

	};

	var formValidator = function(){
		$("#approvalTemplateForm").validate({
			rules : {
				opinion : {
					required :true,
					maxlength:500
				},
				sort:{
					digits:true,
					min:1,
					max:255
				}
			},
			messages : {
				opinion : {
					required:lang.validApprovalOpinion,
					maxlength:lang.validLong
				},
				sort:lang.validNo
			}
		});
	};
	var getApprovalTemplate = function(id){
		$.ajax({
			url: getApprovalTemplateServerUrl() + "getApprovalTemplate",
			data: {id : id},
			type: "get",
			success: function (data) {
				Tool.deserialize("approvalTemplateForm", data);
			}
		});
	};

	var registerNewButton = function () {
		//注册新建按钮事件
		var slidebar = Util.slidebar({
			url: approvalTemplateHtml,
			width: "580px",
			cache: false,
			close : true,
			afterLoad: function () {
				formValidator();
				//注册保存按钮事件
				$("#saveBtn").on("click", function () {
					if($("#approvalTemplateForm").valid()){
						var data = Tool.serialize("approvalTemplateForm");
						$.ajax({
							url: getApprovalTemplateServerUrl() +"saveApprovalTemplate",
							data: data,
							type: "post",
							success: function (data) {
								Util.alert(data.message);
								slidebar.close();
								createApprovalTemplateGrid();
							}
						});
					}

				});
			}
		});
	};
	var editApprovalTemplate = function(row) {
		var slidebar = Util.slidebar({
			url: approvalTemplateHtml,
			width: "580px",
			cache: false,
			close : true,
			afterLoad: function () {
				//增加校验
				formValidator();
				//查询表单数据
				getApprovalTemplate(row.id);
				//注册保存按钮事件
				$("#saveBtn").on("click", function () {
					if($("#approvalTemplateForm").valid()){
						var data = Tool.serialize("approvalTemplateForm");;
						$.ajax({
							url: getApprovalTemplateServerUrl() + "saveApprovalTemplate",
							data: data,
							type: "post",
							success: function (data) {
								Util.alert(data.message);
								slidebar.close();
								createApprovalTemplateGrid();
							}
						});
					}
				});
			}
		});
	};
	var registerDelButton = function() {
		var rows = Grid.getGrid("approvalTemplateGird").getSelectedRow();
		if (rows == null || rows.length == 0) {
			Util.alert(commonLang.selectOne);
			return;
		}
		Util.confirm(lang.isDelete, function() {
			var ids = "";
			$.each(rows, function(i, row){
				ids += row.id + ",";
			});
			//删除
			$.ajax({
				url: getApprovalTemplateServerUrl() + "deleteApprovalTemplates",
				data: {
					ids : ids
				},
				type: "post",
				success: function (data) {
					createApprovalTemplateGrid();
				}
			});
		}, function() {
			return;
		});

	};

	return {
		init:init
	};
});
