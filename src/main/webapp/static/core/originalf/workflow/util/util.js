define(["jquery"],function($){
    var util = {};

    util.resetData =function(selector){
        var aEle = $(selector  + " :input");
        aEle.each(function(){
            $(this).val("");
        });
    };
    util.setData =function(selector,data){
        util.resetData(selector);
        var aEle = $(selector + " input," + selector + " select,"  + selector + " textarea");
        for (var name in data) {
            aEle.each(function(){
                var eleName = $(this).attr("name") || $(this).attr("id");
                if (eleName == name) {
                    $(this).val(data[name]);
                }
            });
        }
    };
    util.getData =function(selector){
        var aEle = $(selector + " input," + selector + " select,"  + selector + " textarea");
        var data = {};
        aEle.each(function(i, value){
            var eleName = $(this).attr("name") || $(this).attr("id");
            if (eleName) {
                data[eleName] = $(this).val();
            }
        });
        return data;
    };
    return util;
});