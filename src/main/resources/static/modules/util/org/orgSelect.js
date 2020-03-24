/**
 * Created by YiYing on 2015/2/10.
 */
define(["PDUtilDir/org/dataSelect"],function(DataSelect){
    /**
     * 数据选择接口
     * @param param
     * @constructor
     */
    var CS_OrgSelect = function(param){
        var _param = $.extend({
            multi : false,
            hideTag : false,
            tagData : []
        },param);
        var targatNode = $("#"+param.id);
        if(targatNode.length){
            targatNode.on("click",function(){
                DataSelect(_param);
            });
        }else{
            DataSelect(_param);
        }
    };

    function getOrgSelect(id){
        return DataSelect.getData(id);
    }

    return {
        CS_OrgSelect : CS_OrgSelect,
        CS_getOrgSelect : getOrgSelect
    }
});