/**
 * Created by gzy on 2017/5/8.
 * 初始化ztree的滚动条，根据tree旁边的 div 的高度，设置ztree的高度
 */
define(["jquery"],function($){

    // 参数分别是div 的 Id 和 zTree的div 的Id
    //默认tree和 div 是并列关系，否则两者可能不会完美对齐
    var initZtreeScrollBar = function(divId,treeId){
        $('div#'+treeId+".ztree").css("overflow-x","auto");
        $('div#'+treeId+".ztree").css("overflow-y","auto");
        var height=0;
        height=$('#'+divId).height(); //获取div高度
        if(height!=0){
            height=height-20;   // ztree在垂直方向上有20px的padding,需要减掉
            height= height - $('div.PD_Ztree:has(#'+treeId+') div :first-child').height() - 4 - 4 - 1;  //减去ztree中toolbar的高度
            height =height - 4;  //减去ztree父div的父div的4px的padding
            var MIN_HEIGHT = 458;
            if(height < MIN_HEIGHT){//流程配置管理，进入流程图，点击流程绘制tab再切换回流程配置tab的时候，
                // grid高度还不对，这里加一个每页10行的最小高度
                height = MIN_HEIGHT;
            }
            $('div#'+treeId+".ztree").height(height+"px");
        }
    };

    return {
        initZtreeScrollBar:initZtreeScrollBar
    }
});