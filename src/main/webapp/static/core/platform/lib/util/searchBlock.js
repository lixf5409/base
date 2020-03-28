/**
 * 功能：给制定div、span、tbody等，包装一个block，可以block折叠、展开
 * 参数：
 *      两种传值方式
 *      1. config 直接传入id（内容采用默认方式）
 *      2. config 传入config对象（可定义标题、标题处图标，展开、收缩图标，展开、收缩说明标题） 格式如：
 *      config = {
 *          // 元素id
 *          id: "",
 *          // 显示标题 ，默认为"查询条件"
 *          homeTitle: ""，
 *          // 标题左侧的图标
 *          homeIcon: "",
 *          // 展开图标
 *          expandIcon: "",
 *          // 展开提示
 *          expandTitle: "",
 *          // 折叠图标
 *          collapseIcon: "",
 *          // 折叠提示
 *          collapseTitle: ""
 *      }
 *
 * 调用方式：
 *      define(["xxx/searchBlock"], function (searchBlock){
 *          ...
 *          // 元素id
 *          var config = "queryConditions";
 *          searchBlock.init(config);
 *          
 *      })
 */
define(['PDUtilDir/alert'/*, 'css!PDUtilDir/css/searchBlock'*/], function(Alert) {
    var searchBlock = {};
    //var _this;
    //var $block;
    searchBlock.init = function (config) {
        var _this = this;

        if (config === '' && !config.id) {
            Alert({
            	message: '请指定要绑定的id'
            });
            return false;
        }

        // search块的id信息
        this.id = config.id ? config.id : config;
        
        // 如果已经加载了searchBlock，则不重复加载
        if ($('#' + _this.id).parent('.pd-search-body').length > 0) {
            return false;
        }

        // search块头部的标题
        this.homeTitle = config.homeTitle ? config.homeTitle : '查询条件';

        // search块头部右侧的图标
        this.homeIcon = config.homeIcon ? config.homeIcon : 'fa fa-search';

        // search块展开图标
        this.expandIcon = config.expandIcon ? config.expandIcon : 'fa fa-angle-double-down';

        // search块展开提示
        this.expandTitle = config.expandTitle ? config.expandTitle : '展开';

        // search块折叠图标
        this.collapseIcon = config.collapseIcon ? config.collapseIcon : 'fa fa-angle-double-up';

        // search块折叠提示
        this.collapseTitle = config.collapseTitle ? config.collapseTitle : '折叠';

        // 创建search块
        createSearchBlock(_this);
    };

    // 创建search块
    var createSearchBlock = function (_this) {
        // 包装一层search-body
        $('#' + _this.id).wrap('<div class="pd-search-body"></div>');
        var $searchBody = $('#' + _this.id).parent();
        // 包装一层wrap
        $searchBody.wrap('<div class="pd-search-container pd-expandMode"></div>');
        var $searchWrap = $searchBody.parent();
        // 添加search标题
        var $searchTitle =  $(
        		'<div class="pd-search-title">' +
        			'<i class="' + _this.homeIcon + '"></i>' + _this.homeTitle + 
        			'<a class="pd-search-click">' +
        				'<i class="' + _this.collapseIcon + '" title="' + _this.collapseTitle + '"></i>' + 
    				'</a>' +
				'</div>'
		);
		$searchTitle.insertBefore($searchBody);
        // 展开/折叠searchBlock
        toggleSearchBlock(_this, $searchWrap);
    };

    // 展开/折叠searchBlock
    var toggleSearchBlock = function (_this, $block) {
        // 点击箭头图标展开/折叠
    	$($block).find('.pd-search-click i').bind('click', function () {
            // 展开折叠的实现函数
            toggleSupport(this,_this);
        });

        // 标题栏双击展开/折叠功能
    	$($block).find('.pd-search-title').bind('dblclick', function () {
            // 展开/折叠图标对象
            var obj = $(this).find('.pd-search-click i');
            // 展开折叠的实现函数
            toggleSupport(obj,_this);
        });

        // 展开折叠的实现方法
        function toggleSupport(obj,_this){
            // 切换展开/折叠图标
            $(obj).toggleClass(_this.collapseIcon).toggleClass(_this.expandIcon);

            // 切换展开/折叠的title提示
            if ($(obj).attr('title') == _this.collapseTitle) {
                $(obj).attr('title', _this.expandTitle);
            } else {
                $(obj).attr('title', _this.collapseTitle);
            }

            // 搜索栏展开/折叠
            $block.find('.pd-search-body').slideToggle();
            $block.closest('.pd-search-container').toggleClass('pd-expandMode').toggleClass('pd-collapseMode');
        }
    };

    return searchBlock;
});