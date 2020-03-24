define(["jquery",
	"PDUtilDir/alert",
	"PDUtilDir/menu",
    "ZTree",
	"MCScrollbarDir/jquery.mCustomScrollbar.concat.min",
	"css!MCScrollbarDir/jquery.mCustomScrollbar.min", 
	"css!ZTreeCss"/*,"css!PDUtilDir/css/localZTree"*/], function($, Alert, Menu){
	
	/**
	 * init tree
	 */
	function init($tree, zSetting, zNodes){
		if(!zSetting){
			return false;
		}
		
		//初始化setting
		settingInit(zSetting);
		if(zSetting.extraSets && zSetting.extraSets.scroll && zSetting.callback){
			var onClick = zSetting.callback.onClick;
			zSetting.callback.onClick = function(event, treeId, treeNode, clickFlag){
				onClick && onClick(event, treeId, treeNode, clickFlag);
				refreshScroll($tree, $(event.target).parent().parent());
			};
		}
        var zTreeObj = $.fn.zTree.init($tree, zSetting, zNodes);
		if(zSetting.extraSets){
			renderTree($tree, zSetting);
		}
		
		return zTreeObj;
	}
	
	function settingInit(zSetting) {
		if (zSetting.extraSets && zSetting.extraSets.contextMenu) {
			//创建menu
			var menu = Menu(zSetting.extraSets.contextMenu);
			//获取并保存onRightClick
			var onRightClick = zSetting.callback ? zSetting.callback.onRightClick : false;
			//重新定义onRightClick
			zSetting.callback.onRightClick = function(event, treeId, treeNode) {
				onRightClick && onRightClick(event, treeId, treeNode, menu);
			}
		}
	}
	
	/**
	 * destroy
	 */
	function destroy(treeId, callback){
		var $treeWrapper = $('#treeWrapper-' + treeId),
            $tree = $('#' + treeId),
			zTreeObj = $.fn.zTree.getZTreeObj(treeId);
		if(!zTreeObj || !$treeWrapper.length){
			return false;
		}
        if(zTreeObj.setting.extraSets.scroll){
            $tree.mCustomScrollbar('destroy');
        }
        $treeWrapper.replaceWith($tree);
		$.fn.zTree.destroy(treeId);
		typeof callback == 'function' ? callback() : false;
	}
	
	/*
	 * 刷新树
	 */
	function refreshScroll($tree, target){
		var treeId = $tree.attr("id");
		var dictTree = $.fn.zTree.getZTreeObj(treeId);
		if($tree instanceof jQuery && dictTree.setting &&
				dictTree.setting.extraSets &&
				dictTree.setting.extraSets.scroll){
			$tree.parent().mCustomScrollbar("update");
			if(target){
				$tree.parent().mCustomScrollbar("scrollTo", target);
			}
		}
	}
	
	/**
	 * 获取ztree对象
	 */
	function getZTreeObj(treeId){
		return $.fn.zTree.getZTreeObj(treeId);
	}
	
	function renderTree($tree, zSetting){
        if(!($tree instanceof jQuery)){
        	return false;
        }
        
		var $treeWrapper = $("#treeWrapper-" + $tree.attr("id"));
		if(!$treeWrapper.length){
			$treeWrapper = $('<div id="treeWrapper-' + $tree.attr("id") + '" class="PD_Ztree"></div>');
			$tree.wrap($treeWrapper);
		}
		if(zSetting.extraSets && zSetting.extraSets.toolbar){
			renderTreeToobar($tree, zSetting.extraSets.toolbar);
		}
		if(zSetting.extraSets && zSetting.extraSets.scroll){
			//包一层，解决树异步加载时，滚动条无法使用的问题-YiYing
			$tree.wrap('<div></div>');
			//设置高度，生成纵向滚动条-YiYing.2017.1.20
			if(zSetting.extraSets.height){
				$tree.parent().css("height", zSetting.extraSets.height)
			}
			$tree.parent().mCustomScrollbar({
				axis:"yx",
				theme: "minimal-dark",
				scrollButtons:{
					enable:true,
					scrollType:"continuous",
					scrollSpeed:20,
					scrollAmount:80
				},
				autoDraggerLength:true,
				advanced:{
					//updateOnContentResize: false,
					autoExpandHorizontalScroll:true,
					autoScrollOnFocus:true
				}
			});
			$tree.addClass("PD_TreeModify");
			//  如果滚动条生效~~需要追加这个事件~
			$(window).resize(function(){
				$(".PD_Ztree .ztree").each(function(){
					refreshScroll($(this));
				});
			});
		}
		//右键菜单
		if (zSetting.extraSets && zSetting.extraSets.contextMenu) {
			/*
			var onRightClick = zSetting.callback.onRightClick;
			var menu = Menu(zSetting.extraSets.contextMenu);
			var treeObj = $.fn.zTree.getZTreeObj($tree.attr("id"));
			zSetting.callback.onRightClick = rightClick;
			
			var rightClick = function() {
				alert("my right click");
			}
			*/
		}
	}
	
	function renderTreeToobar($tree, toolbarSetting){
    	var $container = $("#treeWrapper-" + $tree.attr("id") + " .PD_TreeToolBar");
        if(!$container.length){
            $container = $('<div class="PD_TreeToolBar"></div>');
            $tree.before($container);
        }
        $container.empty();
        var $toolBar = $("<ul></ul>");
        if(toolbarSetting.showDefault){
            $toolBar.append(renderDefaultTool($tree));
        }
        if(toolbarSetting.custom){
            $(toolbarSetting.custom).each(function(i, barItem){
                if(barItem.name && typeof(barItem.name) === "string" &&
                        barItem.callback && typeof(barItem.callback) === "function"){
                    var icon = (barItem.icon && typeof(barItem.icon) === "string") ? barItem.icon : "fa fa-cog";
                    var $item = $("<li><a id=\"" + barItem.id + "\" title=\"" + barItem.name + "\">" +
                            "<i class=\"" + icon + "\"></i></a></li>")
                            .bind("click", function(){
                                barItem.callback.apply(this, []);
                            });
                    $toolBar.append($item);
                }
            });
        }
        $container.append($toolBar);  //.append("<hr width=\"98%\" style=\"border-top-color:#ccc;\">");
    }
	
	/*
	 * 渲染默认的toolbar
	 */
	function renderDefaultTool($tree){
		var treeId = $tree.selector.substr(1);
		var dictTree = $.fn.zTree.getZTreeObj(treeId);
		var $clickTarget = $(".body_wrap") || $(document.body);
		var defaultToolId = treeId + "_defaulttoolbar_" + new Date().getTime();
		var $defaultBar = $("<li><div id=\"" + defaultToolId + "\" class=\"PD_TreeDefaultToolBar\"></div></li>");
		var $showSym = $("<a><i class=\"fa fa-caret-square-o-down\"></i></a>");
		$showSym.addClass("PD_TreeDefaultToolBar_Ctrl")
				.on("click", function(){
					$("#" + defaultToolId).toggle();
				});
		var $toolList = $("<ul></ul>");
//    		var $refresh=$("<li><a title=\"刷新\"><i class=\"fa fa-refresh\"></i></a></li>").bind("click",function(){
//    			dictTree.refresh();
//    			$.fn.zTree.refreshScroll($tree);
//    		}).bind("mouseenter mouseleave",function(){
//    			$(this).find("i").toggleClass("fa-spin");
//    		});
		var $scrollToLeft = $("<li><a title=\"滚动到左侧\"><i class=\"fa fa-angle-double-left\"></i></a></li>").bind("click",function(){
			$tree.mCustomScrollbar("scrollTo","first");
		});
		var $scrollToRight = $("<li><a title=\"滚动到右侧\"><i class=\"fa fa-angle-double-right\"></i></a></li>").bind("click",function(){
			$tree.mCustomScrollbar("scrollTo","right");
			$tree.mCustomScrollbar("scrollTo","bottom");
		});
		var $compressSelectNode = $("<li><a title=\"收缩全部\"><i class=\"fa fa-compress\"></i></a></li>").bind("click",function(){
			dictTree.expandAll(false);
			refreshScroll($tree);
		});
		var $expandSelectNode = $("<li><a title=\"展开全部\"><i class=\"fa fa-expand\"></i></a></li>").bind("click",function(){
			dictTree.expandAll(true);
			refreshScroll($tree);
		});
		var $compressAll = $("<li><a title=\"收缩所选\"><i class=\"fa fa-angle-up\"></i></a></li>").bind("click",function(){
    		var curNode = getTreeSelectedNode(treeId);
			if(curNode){
				dictTree.expandNode(curNode, false, true);
				refreshScroll($tree);
			}else{
				Alert({
					message: "请选择需要收缩的节点"
				});
			}
		});
		var $expandAll = $("<li><a title=\"展开所选\"><i class=\"fa fa-angle-down\"></i></a></li>").bind("click",function(){
			var curNode = getTreeSelectedNode(treeId);
			if(curNode){
				dictTree.expandNode(curNode, true, true);
				refreshScroll($tree);
			}else{
				Alert({
					message: "请选择需要展开的节点"
				});
			}
		});
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
    	var dictTree = $.fn.zTree.getZTreeObj(treeId);
    	var nodes = dictTree.getSelectedNodes();
    	
		return nodes.length > 0 ? nodes[0] : null;
    }
	

	return {
		init: init,
		destroy: destroy,
		refreshScroll: refreshScroll,
		getZTreeObj: getZTreeObj
	};
});