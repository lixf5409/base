/**
 * Excel导入公共组件
 * 
 * @author gaodongsheng@resoft.css.com.cn
 */
define([ "jquery", "PDUtilDir/dialog", "WebUploader", "text!PDUtilDir/excel/excelImport.html", "css!WebUploaderCss" ], function ($, Dialog, WebUploader, body) {

    function init(options) {
        return new ExcelImport(options);
    }

    function ExcelImport(options) {
        var _this = this;
        var defaultOptions = {
            title : "导入",
            serviceName : null,
            template : {
                mapping : {},
                downloadUrl : ""
            },
            progress : "auto",
            events : {
                onComplete : null
            }
        };
        _this.options = $.extend(true, defaultOptions, options);
        _this.options.dialogId = "oriExcelImportDialog";
        _this.options.dialogBody = body;
        _this.dialog = showDialog(_this.options);
        // 设置模板下载路径
        setDownUrl(_this.options);
        loadWebUploader(_this.options, _this.dialog);
    }

    function showDialog(options) {
        var dialog = Dialog({
            id : options.dialogId,
            title : options.title,
            cache : false,
            modal : {
                backdrop : "static"
            },
            drag : true,
            body : options.dialogBody
        });
        return dialog;
    }

    function setDownUrl(options) {
        $("#downloadExcelTemplate").attr("href", options.template.downloadUrl);
    }

    function loadWebUploader(options, dialog) {
        if (!WebUploader.Uploader.support()) {
            alert('Flash版本过低，请尝试升级 flash 版本到11.4以上.');
            throw new Error('WebUploader does not support the browser you are using.');
            return false;
        }
        // 附件上传控件初始化
        var uploader = WebUploader.create({
            swf : getStaticPath() + '/modules/webuploader/Uploader.swf',
            server : getControllerPath() + "/ExcelImportCtrl/" + options.serviceName,
            accept : {
                title : 'excel',
                extensions : 'xls,xlsx',
                mimeTypes : 'application/vnd.ms-excel.12,application/vnd.ms-excel'
            },
            pick : {
                id : '#ImportExcelPanel',
                label : '<i class="glyphicon glyphicon-paperclip"></i>&nbsp;请选择Excel',
                multiple : false
            },
            timeout : 0
        });
        // 设置上传按钮
        dialog.setFoot([ {
            name : "开始上传",
            callback : function () {
                uploader.upload();
            }
        } ]);
        // 设置样式，必须uploader初始化后才能设置
        var panel = $("#ImportExcelPanel");
        panel.children(":first").css({
            "width" : "100px",
            "height" : "25px",
            "padding" : "3px"
        });
        panel.children(":last").css({
            "background" : "#00b7ee"
        });
        panel.find("label").hover(function () {
            panel.children(":last").css({
                "background" : "#00b7ee"
            });
        }, function () {
            panel.children(":last").css({
                "background" : "#00a2d4"
            });
        });
        // IE8、9兼容
        if (/msie [89]/.test(navigator.userAgent.toLowerCase())) {
            $("#ImportExcelPanel div:first").css("background-color", "#00B7EE");
            $("#ImportExcelPanel div:last").css("background-color", "");
        }

        // 把附件增加到待上传列表中
        uploader.on('fileQueued', function (file) {
            $("#importExcelInfo").show();
            $("#importExcelFileName").html(file.name);
        });
        // 附件上传数据发送之前触发
        uploader.on('uploadBeforeSend', function (object, data, headers) {
            data["formData"] = encodeURI(JSON.stringify(options.template.mapping));

            $("#importExcelStatus").html("开始导入，请耐心等待...");
        });
        // 附件上传成功后触发
        uploader.on('uploadSuccess', function (file, response) {
            // 隐藏上传按钮
            $("#ImportExcelPanel").hide();
            if (typeof (res) == "object") {
                $("#importExcelStatus").html("导入失败");
                $("#importExcelErrorInfo").html("<code>服务器端异常，请查看错误日志</code>");
            } else {
                if (response.status) {
                    $("#importExcelStatus").html("导入完成");
                    $("#importNumber").html("<code>成功导入" + response.succedNum + "条数据.</code>");
                } else {
                    $("#importExcelStatus").html("导入失败");
                }
                var msgAry = [];
                $.each(response.messages, function (index, item) {
                    msgAry.push('<code>' + item + '</code><br/>');
                });
                $("#importExcelErrorInfo").html(msgAry.join(''));
            }
            typeof (options.events.onComplete) == "function" && options.events.onComplete();
        });

    }

    return init;
});