define(["jquery",
	"PDUtilDir/alert",
	"ZTree",
	"MCScrollbarDir/jquery.mCustomScrollbar.min", 
	"MCScrollbarDir/jquery.mCustomScrollbar.concat.min", 
	"css!MCScrollbarDir/jquery.mCustomScrollbar.min", 
	"css!ZTreeCss","css!PDUtilDir/css/localZTree"],function($, Alert){
	
	var cloneZtreeInit;
	var cloneZtreeDestroy;
	var cloneZtreeGetTreeObj;
	(function(){
		cloneZtreeInit=$.fn.zTree.init;
		cloneZtreeDestroy=$.fn.zTree.destroy;
		cloneZtreeGetTreeObj=$.fn.zTree.getZTreeObj;
	})();
	/**
	 * init tree
	 */
	function init(obj,zSetting,zNodes){
		if(zSetting&&zSetting.callback&&zSetting.callback.onClick){
			var cloneCallbackOnClick=zSetting.callback.onClick;
			zSetting.callback.onClick=function(event, treeId, treeNode, clickFlag){
				if(typeof(cloneCallbackOnClick)==="function"){
					cloneCallbackOnClick(event, treeId, treeNode, clickFlag);
					refreshScroll(obj,$(event.target).parent().parent());
				}
			};
		}
		var treeObj=cloneZtreeInit(obj,zSetting,zNodes);
		renderTree(obj,treeObj);
		return treeObj;
	};
	
	/**
	 * destroy
	 */
	function destroy(treeId,callback){
		var zTreeObj=cloneZtreeGetTreeObj(treeId);
		if(zTreeObj){
			var $dom=zTreeObj.setting.treeObj;
			if(zTreeObj.setting && zTreeObj.setting.extraSets){
				var extraSets=zTreeObj.setting.extraSets;
				//  先销毁滚动条
				if(extraSets.scroll){
					$dom.mCustomScrollbar("destroy");
				}
				// 销毁tree的包装容器~
				if(extraSets.toolbar){
					var $modifier=$dom.parent();
					$modifier.parent().prepend($dom);
					$modifier.remove();
				}
			}
		}
		//  最后销毁ztree
		cloneZtreeDestroy(treeId);
		if(typeof(callback)==="function"){
			callback();
		}
	};
	
	/*
	 * 刷新树
	 */
	function refreshScroll(obj,target){
		var treeId=obj.attr("id");
		var dictTree=cloneZtreeGetTreeObj(treeId);
		if(obj instanceof jQuery&& dictTree.setting&&
				dictTree.setting.extraSets &&
				dictTree.setting.extraSets.scroll){
			obj.mCustomScrollbar("update");
			if(target){
				obj.mCustomScrollbar("scrollTo",target);
			}
		}
	}
	/**
	 * 获取ztree对象
	 */
	function getZTreeObj(treeId){
		return cloneZtreeGetTreeObj(treeId);
	}
	
	function renderTree(obj,treeObj){
		var curTreeId=treeObj.setting.treeId+"_parent_"+new Date().getTime();
		var $parent=$("#"+curTreeId).length>0?$("#"+curTreeId):$("<div id=\""+curTreeId+"\" class=\"PD_Ztree\"> </div>");
		if($parent.children().length==0&&obj instanceof jQuery){
			var $outContainer=obj.parent();
			if(treeObj.setting&&treeObj.setting.extraSets&&treeObj.setting.extraSets.toolbar){
				var toolbarSetting=treeObj.setting.extraSets.toolbar;
				$parent.append(renderTreeToobar(obj,toolbarSetting));
			}
			$parent.append(obj);
			obj.css("overflow","hidden");
			$outContainer.append($parent);

			/*$parent.css("width","inherit")
				   .css("height","inherit");*/
			if(obj instanceof jQuery && treeObj.setting.extraSets && treeObj.setting.extraSets.scroll){
				obj.mCustomScrollbar({
					axis:"yx",
					theme: "minimal-dark",
					scrollButtons:{
						enable:true,
						scrollType:"continuous",
						scrollSpeed:20,
						scrollAmount:40
					},
					autoDraggerLength:true,
					advanced:{
//							updateOnContentResize: false,
						autoExpandHorizontalScroll:true,
						autoScrollOnFocus:true
					}
				});
				obj.addClass("PD_TreeModify");
				//  如果滚动条生效~~需要追加这个事件~
				$(window).resize(function(){
					$(".PD_Ztree .ztree").each(function(){
						refreshScroll($(this));
					});
					
				});
			}
		}
	}
	function renderTreeToobar(obj,toolbarSetting){
    	var $container;
    	if(obj instanceof jQuery){
    		$container=$("<div class=\"PD_TreeToolBar\"> </div>");
    		var $toolBar=$("<ul></ul>");
    		if(toolbarSetting.showDefault){
    			$toolBar.append(renderDefaultTool(obj));
    		}
    		if(toolbarSetting.custom){
    			$(toolbarSetting.custom).each(function(i,barItem){
    				if(barItem.name && typeof(barItem.name)==="string" && 
    						barItem.callback && typeof(barItem.callback)==="function"){
    					var icon=(barItem.icon && typeof(barItem.icon)==="string") ? barItem.icon : "fa fa-cog";
    					var $item=$("<li><a title=\""+barItem.name+"\">" +
    							"<i class=\""+icon+"\"></i></a></li>")
    							.bind("click",function(){
    								barItem.callback.apply(this,[]);
    							});
    					$toolBar.append($item);
    				}
    			});
    		}
    		$container.append($toolBar);  //.append("<hr width=\"98%\" style=\"border-top-color:#ccc;\">");
    	}
    	return $container;
    }
	/*
	 * 渲染默认的toolbar
	 */
	function renderDefaultTool(obj){
		var treeId=obj.selector.substr(1);
		var dictTree=cloneZtreeGetTreeObj(treeId);
		var $clickTarget=$(".body_wrap") || $(document.body);
		var defaultToolId=treeId+"_defaulttoolbar_"+new Date().getTime();
		var $defaultBar=$("<li><div id=\""+defaultToolId+"\" class=\"PD_TreeDefaultToolBar\"></div></li>");
		var $showSym=$("<a><i class=\"fa fa-caret-square-o-down\"></i></a>")
	    		.unbind("mouseover").unbind("mouseout")
				.bind("mouseover",function(){
					$("#"+defaultToolId).show();
	    			$(this).addClass("PD_TreeDefaultToolBar_Ctrl");
	    			$clickTarget.unbind("mouseup").bind("mouseup",function(e){
	        			if(!$("#"+defaultToolId).is(e.target)  && $("#"+defaultToolId).has(e.target).length === 0){
	        				toggleDefaultBar($showSym);
	        				//取消事件
	        				$clickTarget.unbind("mouseup");
	        				
	        			}
	        		});
	    		});
		
		function toggleDefaultBar($defaultBar){
			$defaultBar.toggleClass("PD_TreeDefaultToolBar_Ctrl");
			$("#"+defaultToolId).toggle();
		}
		var $toolList=$("<ul></ul>");
//    		var $refresh=$("<li><a title=\"刷新\"><i class=\"fa fa-refresh\"></i></a></li>").bind("click",function(){
//    			dictTree.refresh();
//    			$.fn.zTree.refreshScroll(obj);
//    		}).bind("mouseenter mouseleave",function(){
//    			$(this).find("i").toggleClass("fa-spin");
//    		});
		var $scrollToLeft=$("<li><a title=\"滚动到左侧\"><i class=\"fa fa-angle-double-left\"></i></a></li>").bind("click",function(){
			obj.mCustomScrollbar("scrollTo","first");
		});
		var $scrollToRight=$("<li><a title=\"滚动到右侧\"><i class=\"fa fa-angle-double-right\"></i></a></li>").bind("click",function(){
			obj.mCustomScrollbar("scrollTo","right");
			obj.mCustomScrollbar("scrollTo","bottom");
		});
		var $compressSelectNode=$("<li><a title=\"收缩全部\"><i class=\"fa fa-compress\"></i></a></li>").bind("click",function(){
			dictTree.expandAll(false);
			refreshScroll(obj);
		});
		var $expandSelectNode=$("<li><a title=\"展开全部\"><i class=\"fa fa-expand\"></i></a></li>").bind("click",function(){
			dictTree.expandAll(true);
			refreshScroll(obj);
		});;
		var $compressAll=$("<li><a title=\"收缩所选\"><i class=\"fa fa-angle-up\"></i></a></li>").bind("click",function(){
    		var curNode=getTreeSelectedNode(treeId);
			if(curNode){
				dictTree.expandNode(curNode,false,true);
				refreshScroll(obj);
			}else{
				Alert({
					message: "请选择需要收缩的节点"
				});
			}
		});;
		var $expandAll=$("<li><a title=\"展开所选\"><i class=\"fa fa-angle-down\"></i></a></li>").bind("click",function(){
			var curNode=getTreeSelectedNode(treeId);
			if(curNode){
				dictTree.expandNode(curNode,true,true);
				refreshScroll(obj);
			}else{
				Alert({
					message: "请选择需要展开的节点"
				});
			}
		});;
		$toolList.append($scrollToLeft).append($scrollToRight)
	    		.append($expandSelectNode).append($compressSelectNode)
			    .append($expandAll).append($compressAll);
		$defaultBar.find("div").append($toolList);
		$defaultBar.append($showSym);
		return $defaultBar;
	}
	
	/**
     * 获取选择的单个节点
     */
    function getTreeSelectedNode(treeId){
    	var dictTree=cloneZtreeGetTreeObj(treeId);
    	var nodes=dictTree.getSelectedNodes();
		var curNode=nodes.length>0?nodes[0]:undefined;
		return curNode;
    }
	

	return {
		init:init,
		destroy:destroy,
		refreshScroll:refreshScroll,
		getZTreeObj:getZTreeObj
	};
});