define(["jquery","css!WebUploaderCss"], function($){
    var initFileUploaderDiv = function (id) {
        $("#" + id).append("<label class=\"control-label\" >二、请选择需要导入的Excel文件:</label>\n" +
            "                <div id=\"ImportExcelPanel\" class=\"webuploader-container\">\n" +
            "                    <div id=\"webuploaderPickDiv\" class=\"webuploader-pick\" style=\"width: 100px; height: 25px; padding: 3px; background: rgb(0, 183, 238);\">\n" +
            "                        <i class=\"glyphicon glyphicon-paperclip\"></i>&nbsp;请选择Excel\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "                <div class=\"attention_content\" id=\"importExcelInfo\" style=\"display:none\">\n" +
            "                    <div id=\"importExcelFileName\"></div>\n" +
            "                    <p style=\"margin:0\">状态：<span style=\"color:red\" id=\"importExcelStatus\">待上传</span></p>\n" +
            "                </div>");
        var panel = $("#ImportExcelPanel");
        panel.children(":first").css({
            "width": "100px",
            "height": "25px",
            "padding": "3px"
        });
        panel.children(":last").css({"background": "#00b7ee"});
        panel.find("label").hover(function() {
            panel.children(":last").css({"background": "#00b7ee"});
        }, function() {
            panel.children(":last").css({"background": "#00a2d4"});
        });
        //IE8、9兼容
        if(/msie [89]/.test(navigator.userAgent.toLowerCase())){
            $("#ImportExcelPanel div:first").css("background-color","#00B7EE");
            $("#ImportExcelPanel div:last").css("background-color","");
        }
        //把附件增加到待上传列表中
        $("#excelFile").on( 'change', function() {
            $("#importExcelInfo").show();
            var fileName = $(this).val();
            $("#importExcelFileName").html(fileName.substring(fileName.lastIndexOf("\\") + 1));
        });
        return "webuploaderPickDiv";
    };

    var initUploaderResult = function (resMsg) {
        $("#ImportExcelPanel").hide();
        $("#importExcelStatus").html(resMsg);
    };

    return {
        initFileUploaderDiv:initFileUploaderDiv,
        initUploaderResult:initUploaderResult
    }
});