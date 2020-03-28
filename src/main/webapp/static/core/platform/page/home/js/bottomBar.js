// 初始化cs-bt-tbar（暂时不用）
    +function(){
    	// 是否启用
    	//if (shortcutEnable == "false") return ;
		//惠昕提出的可即时生效（不需刷新页面）需求改造
		var style = "display:block";
        if (_shortcutEnable == "false") {style="display:none"}
    	
        // 添加html
    	var html = 
    			'<div id="cs-bt-tbar" class="cs-bt-tbar" style="' + style + '">' +
					'<div class="cs-bt-tbar-tab">' +
						'<span class="fa fa-link"></span>' +
					'</div>' +
					'<div class="cs-bt-tbar-sub shortcut">' +
					'</div>' +				
				'</div>';
    	$(html).appendTo($(".body-wrap"));
    	
    	// 变量缓存
    	var $tbar = $("#cs-bt-tbar"); // 最外层jq对象
    	var $tbarTab = $tbar.find(".cs-bt-tbar-tab"); // 图标jq对象
    	var $tbarSub = $tbar.find(".cs-bt-tbar-sub.shortcut");	// 放快捷菜单的jq对象
    	var $main = $("#main-tab-content");	// 容器（放遮罩层用）

    	// 绑定事件
    	var tbar_timer;
    	function mouseenter() {
    		var _this = this;
    		clearTimeout(tbar_timer);
    		tbar_timer = setTimeout(function(){
    			//$(_this).find(".cs-bt-tbar-sub").fadeIn();
    			$tbarSub.fadeIn();
    				$.ajax({
    					url : getServicePath() + "/shortcut/getByUser",
    					success : function(data) {
    						//$(".cs-bt-tbar-sub.shortcut").empty();
    						$tbarSub.empty();
    						if (data && data.length > 0) {
    							var html = [];
    							$.each(data, function(i, n){
    								/*
        							if (n.menuOpen == "1" || n.menuOpen == "3") { //本窗口 / 新窗口-本域-路由
                						n.router = true;
                						(n.menuOpen == "3") && (n.openNew = true);
                					} else if (n.menuOpen == "5") { //新窗口-本域-非路由
                						n.openNew = true;
                						n.menuUrl = getServer() + "/" + n.menuUrl;
                					} else if (n.menuOpen == "7") { //新窗口-跨域
                						n.openNew = true;
                					}
        							var href = n.router ? ("#" + n.menuRouter || "|| 'javascript:;") : (n.menuUrl || "javascript:;");
        							var target = n.openNew ? "_blank" : "";
        							var str = "<a href='" + href +"' target='" + target + "'  title='" + n.menuName + "'>" + n.menuName + "</a>";
        							html.push(str);
    								 */
    								var click = 'window.menuGo && window.menuGo("' + n.menuId + '")';
    								var href = 'javascript:;';
    								var str = "<a href='" + href +"' title='" + n.menuName + "' onclick='" + click + "'>" + n.menuName + "</a>";
    								html.push(str);
    							})
    							$tbarSub.html(html.join(" "));
    						}
    					}
    				})
    		}, 300);
    	}
    	function mouseleave() {
    		var _this = this;
    		clearTimeout(tbar_timer);
    		tbar_timer = setTimeout(function(){
    			$tbarSub.fadeOut();
    		}, 300);
    	}
    	// 添加鼠标enter和leave事件，将快捷菜单显示或隐藏
    	$tbar.on("mouseenter", mouseenter).on("mouseleave", mouseleave);

    	//拖动
    	$tbarTab.on("mousedown", function(e){
    		var _this = this;
    		
    		// 改变鼠标样式
    		$tbar.css("cursor", "move")
    				
    		// 调整z-index
    		$tbar.css("z-index", 1031);
    		
    		// 将子页面隐藏并把事件取消
    		$tbarSub.hide();
    		$tbar.off("mouseenter").off("mouseleave");
    		
    		// 给main-tab-content添加一个遮罩（优化iframe存在时会影响鼠标事件的响应速度）
    		$("<div></div>").appendTo($main).css({
    			//"border": "1px solid red",
    			//"background":"#fff",
    			"position": "absolute",
    			"top": 0,
    			"left": 0,
    			"right": 0,
    			"bottom": 0
    		});
    		
    		// 记录当前位置（bottom\right）
    		var pos = {
    				bottom: parseInt($tbar.css("bottom")),
    				right: parseInt($tbar.css("right"))
    		}
    		// 记录当前位置（left\top）
    		var startPoint = {
    			left: e.clientX,
    			top: e.clientY
    		}
    		
    		$(document).on("mousemove.tbar", function(e){
    			var offsetLeft = e.clientX - startPoint.left;
    			var offsetTop = e.clientY - startPoint.top;
    			
    			$tbar.css({
    				bottom: pos.bottom - offsetTop,
    				right: pos.right - offsetLeft
    			})
    			
    			e.preventDefault();
        		return false;
    		});
    		
    		$(document).on("mouseup.tbar", function(e){
    			// 鼠标样式
    			$(_this).css("cursor", "pointer");
    			
    			// 添加事件
    			$tbar.on("mouseenter", mouseenter).on("mouseleave", mouseleave);
    			
    			// 删除遮罩
    			$main.children().last().remove();
    			
    			$(document).off("mousemove.tbar");
    			$(document).off("mouseup.tbar");
    			
    			e.preventDefault();
        		return false;
    		});
    		
    		e.preventDefault();
    		return false;
    	});
    }();