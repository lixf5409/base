define(["PDUtilDir/slidebar", 
        "PDUtilDir/loading",
        'PDUtilDir/alert',
        'PDUtilDir/confirm',
        "ArtTemplateNative", 
        "jquery"],function(Slidebar, Loading, Alert, Confirm, ArtTemplate){
    var util = {};
    /**
     * 简单模板引擎
     */
    util.template = (function(){
        //var cache = {};
        return function(str, data) {
        	return ArtTemplate(str, data);
            // Figure out if we're getting a template, or if we need to
            // load the template - and be sure to cache the result.
        	//------------------------------------------------//
            /*
            var fn = !/\W/.test(str) ? cache[str] = cache[str] || util.template(document.getElementById(str).innerHTML) :
                // Generate a reusable function that will serve as a template
                // generator (and which will be cached).
                new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +
                    // Introduce the data as local variables using with(){}
                    "with(obj){p.push('" +
                    // Convert the template into pure JavaScript
                    str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
            // Provide some basic currying to the user
            return data ? fn(data) : fn;
            */
        	//------------------------------------------------//
        };
    })();

    /**
     * 用法：require(["PDUtilDir/util"],function(u){u.alert("请填写基本信息！")})
     * @param message
     * @param title
     */
    util.alert = function(message, title, afterClose){
    	var config = {
    		events: {}
    	};
    	
		if(typeof(message) == 'object'){
			config = message;
		}else{
			config.message = message;
			if(typeof(title) == 'function'){
				config.title = '系统信息';
				config.events.afterClose = title;
			}else{
				config.title = title ? title: '系统信息';
				config.events.afterClose = afterClose;
			}
		}
		
    	Alert(config);
    };

    /**
     * 用法：require(["PDUtilDir/util"],function(u){u.confirm("确认提交？",function(){console.log("是")},function(){console.log("否")})})
     * @param message
     * @param okCallback
     * @param cancelCallback
     */
    util.confirm = function(message, yesCallback, noCallback, afterClose){//整合回调函数成一个,利用回传参数判断是否成功
        var config = {
        	events: {}
        };
        
        if(typeof(message) == 'object'){
        	config = message;
        }else{
        	config.message = message;
        	config.events.onConfirm = yesCallback;
        	config.events.onCancel = noCallback;
        	config.events.afterClose = afterClose;
        }
        
    	Confirm(config);
    };
    /**
     * config = {
     *   setting : {},                   //dialogSetting
     *   template : templateURL,         //dialogBodyTemplate
     *   afterLoad : function(dialog){},   //afterDialogLoaded callback
     * }
     */
    util.contentDialog = function(config){
        config.setting = $.extend({
            cache : true,
            dialogSize: "modal-lg",
            title : "Dialog",
            id : "system_dialog_contentDialog",
            modal : "hide"
        },config.setting);
        require(["PDUtilDir/dialog","text!"+config.template],function(Dialog,template){
            dialog = Dialog(config.setting);
            dialog.setBody(template);
            (typeof config.afterLoad == "function") && config.afterLoad(dialog);
            dialog.show();
        });
    };
    
    /**
     * 弹出侧边编辑栏组件
     */
    util.slidebar = function(config) {
    	return Slidebar(config);
    }
    
    /*
    util.slidebar = (function(){
        var cache = {};
        return function(config){
            var param = $.extend({
                "id":"",            //直接把模板放页面上
                "url":"",           //URL远程获取模板
                "width":"",
                "cache":true,
                "close":false,      //点击侧边栏之外的区域是否能关闭侧边栏
                "allowClick":[]
            },config);

            //侧边栏对象
            var $Panel;

            var isAllowTarget = function(e){
                //增加对boostrap date组件的支持(由于该组件的HTML自动追加在body上)
                var arr = param.allowClick.concat($('.datetimepicker'));
                for(var i= 0,item;item=arr[i++];){
                    if($(item).is(e.target) || $(item).has(e.target).length){
                        return true;
                    }
                }
                return false;
            };

            var render = function(){
                //设置弹出面板样式
            	$Panel.css({
            		"width":param.width,
            		"right":"-"+param.width
            	});
                //弹出侧边编辑栏
                $Panel.animate({right : 0}, 350,function(){
                    //回调函数执行
                    //typeof(param.afterLoad)=="function" && param.afterLoad.apply(this);
                });
                //添加点击侧边栏之外的元素关闭侧边栏事件监听
                var $target = $(".body_wrap") || $(document.body);
                param.close && $target.unbind("mouseup").bind("mouseup",function(e) {
                    //不是目标区域且不是子元素,且不是自定义允许点击节点
                    if ((!$Panel.is(e.target) && $Panel.has(e.target).length === 0) && !isAllowTarget(e)) {
                        //关闭页面
                        closeSlidebar();
                        //取消事件
                        $target.unbind("mouseup");
                    }
                });
                //增加以添加样式即可关闭侧边栏的方法
                $Panel.find(".closeBtn").on("click",function(e){
                    closeSlidebar();
                });
            };

            //关闭侧边栏方法
            var closeSlidebar = function(){
                $Panel.animate({right: "-"+param.width}, 150,function(){
                    typeof(param.afterClose)=="function" && param.afterClose.apply(this);
                    //如果不缓存,且侧边栏的DOM来自于远程连接，则删除DOM
                    (!param.cache && param.url) && $Panel.remove();
                });
            };
            
            //增加左侧关闭
            var addClose = function(){
                var $left = $("<div class='cs-slidebar-left'><i class='glyphicon glyphicon-chevron-right cs-slidebar-close'></i></div>");
                //设置按钮出现的位置
                //添加关闭侧边栏的事件
                $left.bind("click",function(){
                    closeSlidebar($Panel);
                });
                return $left;
            };
            
            $Panel = cache[param.id || param.url];
            
            if (param.cache && $Panel) {
            	render();
            } else {
            	var $Dom = null;
            	
            	var getDom = function() {
            		var deferred = $.Deferred();
            		
            		//先根据id查找本页dom元素
            		$Dom = param.id && $("#" + param.id);
            		if ($Dom && $Dom[0]) {
            			deferred.resolve();
            		} else {
            			if (!param.url) {
            				deferred.reject();
            			} else {
            				require(['text!'+param.url],function(panel){
                    			$Dom = $(panel);
                    			deferred.resolve();
                    		})
            			}
            		}
            		
            		return deferred.promise();
            	}
            	
            	//监听
            	$.when(getDom()).done(function(){
            		$Panel = $("<div class='cs-slidebar'></div>")
            			.append(addClose())
            			.appendTo($(document.body));
            		var $Content = $("<div class='cs-slidebar-content'></div>")
            			.append($Dom)
            			.appendTo($Panel);
            		$Dom.show();
            		
            		//afterLoad
            		typeof(param.afterLoad)=="function" && param.afterLoad.apply(this);
            		
            		render();
            		
            		cache[param.id || param.url] = $Panel;
            	}).fail(function(){
            		console.log("侧边栏加载dom失败，请确认id或url属性是否设置正确");
            	})
            }
            
            return {
                close:closeSlidebar
            };
        };
    })();
	*/
    
    util.loading = function(config){
    	return Loading(config);
    }
    
    return util;
});