/**
 * Created by YiYing on 2014/12/14.
 */
define(['WebUploader',
    'PDUtilDir/fileupload/fileUpload',
    'PDUtilDir/alert',
    'PDUtilDir/confirm',
    'css!WebUploaderCss'], function(WebUploader, UploadUtil, Alert, Confirm){

    var init = function(options){
        var settings = {
            placeAt: "",
            fileMiddleDir: "",
            allowPhyDelete: true,
            allowDelete: true,
            allowMC: true,
            //onUploadedFile:function(file){},
            //onDeletedFile:function(file){},
            onBeforeFileQueued: function(file){return true},
            onUploadStart: function(file){},
            onUploadError: function(file){},
            onUploadSuccess: function(file){},
            onDeleteSavedFile: function(file){},
            //附件上传配置
            uploadConfig: UploadUtil.getUploadConfig(options), 
            //文件存储路径ID
            fileDirId: ""
        };

        return result(new SimpleUpload($.extend(true, settings, options)).render());

    };

    /**
     * 封装返回对象,控制外部API，避免开发人员使用内部属性或方法，建立隔离层
     * @param upload
     */
    function result(upload) {
        //获取文件统计信息
        var getStats = function() {
            var stats = upload.webUploader.getStats();
            return {
                progressNum:stats.progressNum          //正在上传中的附件数量
                //queueNum:upload.queuedFiles.length      //待上传的附件数量
            }
        };
        
        var setData = function(attachmentId){
            if(attachmentId){
            	upload.renderSavedFile(UploadUtil.getSavedFiles([attachmentId])[0]);
            }
        };

        return {
            getStats:getStats,
            setData:setData
        }
    }

    /**
     * 简单附件上传对象
     * @param settings
     * @constructor
     */
    function SimpleUpload(settings){
        this.file       = null;                 //webuploader的文件对象
        this.$img       = null;                 //附件上传组件图标
        this.$upload    = null;                 //上传图标DOM对象
        this.settings   = settings;
    }

    /**
     * 渲染附件上传组件
     */
    SimpleUpload.prototype.render = function () {
        var html = '<div class="cs-single-upload">'+
                        '<div class="cs-sUpload-body">' +
                            '<div>'+
                                '<input type="text" class="form-control">'+
                            '</div>'+
                        '</div>'+
                    '</div>';
        var progress = '<div class="progress">'+
                            '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 3em;">'+
                                '0%'+
                            '</div>'+
                        '</div>';
        var status  =   '<div class="cs-sUpload-status">' +
                            '<a href=""></a>' +
                            '<i class="fa fa-times" title="删除"></i>'+
                        '</div>';
        this.$container = $(html);
        var _this = this;
        this.$uploadBody = this.$container.find("div:first");
        this.$img       = $('<i class="fa fa-cloud-upload"></i>');
        this.$upload    = $('<i class="fa fa-upload" title="上传"></i>').bind('click',function(){_this.startUpload()});
        this.$uploadBody.append(this.$img).append(this.$upload);
        this.$progress  = $(progress).hide();
        this.$status    = $(status).hide();
        this.$container.append(this.$progress).append(this.$status);
        //添加附件上传组件到指定位置
        var placeAt     = this.settings.placeAt;
        var $placeAt    = typeof(placeAt)=="string" ? $("#"+placeAt) : $(placeAt);
        $placeAt.append(this.$container);

        //上传按钮
        this.settings.uploadConfig.pick = {
            id:this.$uploadBody[0].firstChild,
            multiple:false
        };
        //初始化WebUploader
        this.webUploader    = InitUploader(this,this.settings.uploadConfig);

        //渲染已上传的附件
        var savedFileId = this.settings.data;
        if(savedFileId){
            this.renderSavedFile(UploadUtil.getSavedFiles([savedFileId])[0]);
        }

        return this;
    };


    SimpleUpload.prototype.renderSavedFile = function (file) {
        var _this = this;
        _this.$uploadBody.hide();
        _this.$progress.hide();
        _this.$status.find("a")
            .attr('href',getControllerPath()+'/DownloadController?attachmentId='+file.swordFileId+'&fileDirId='+_this.settings.fileDirId)
            .text(file.name)
            .attr("target","_blank")
            .attr('title',file.name);
        //不允许删除附件控制
        var $removeIcon = _this.$status.find(".fa-times");
        if(!_this.settings.allowDelete){
            $removeIcon.remove();
        }else{
            //删除已上传的附件事件绑定
            $removeIcon.unbind("click").click(function(){
                if(_this.settings.allowPhyDelete){
                	Confirm({
                		message: '是否从服务器中删除该附件?',
                		events: {
                			onConfirm: function(){
                    			$.ajax({
                                    url: getControllerPath() + "/UploadChunkController/attachment/delFile",
                                    dataType: 'json',
                                    data: {
                                        id: file.swordFileId
                                    },
                                    success: function (response) {
                                        if(response.success){
                                            _this.remove();
                                        }else{
                                            Alert({
                                            	message: '删除失败'
                                            });
                                        }
                                    }
                                });
                    		}
                		}
                		
                	});
                }else{
                    //不允许物理删除时，只对Web端进行操作
                    _this.remove();
                }
            });
        }
        _this.$status.show();
    };

    /**
     * 开始上传附件
     */
    SimpleUpload.prototype.startUpload = function(){
        this.webUploader.upload();
    };

    /**
     * 删除附件
     */
    SimpleUpload.prototype.remove = function(){
        this.$container.find("input")[0].value = "";
        //重置uploader。目前只重置了队列。
        this.webUploader.reset();
        //显示隐藏控制
        this.$img.show();
        this.$upload.hide();
        this.$status.hide();
        this.$uploadBody.show();
        this.settings.onDeleteSavedFile.apply(this,[this.file]);
    };

    var InitUploader = function(simpleUpload,config) {
        //开启断点续传
        if(config.chunked==true){
            UploadUtil.register(simpleUpload);
        }

        var uploader = WebUploader.create(config);

        /**
         * 当文件被加入队列之前触发，此事件的handler返回值为false，则此文件不会被添加进入队列。
         */
        uploader.on("beforeFileQueued",function(file){
            var result = simpleUpload.settings.onBeforeFileQueued.apply(simpleUpload,[file]);
            return result;
        });
        /**
         * 当文件被加入队列以后触发。
         */
        uploader.on( 'fileQueued', function( file ) {
            simpleUpload.$container.find("input")[0].value = file.name;
            //显示删除和上传图标
            simpleUpload.$img.hide();
            simpleUpload.$upload.show();
            file.swordProgress = simpleUpload.$progress.find('div[class="progress-bar"]');

            //公共事件部分判断是否来自于附件上传组件
            file.isUploadComponent = true;
        });
        /**
         * 当一批文件添加进队列以后触发。
         */
        uploader.on( 'filesQueued', function( files ) {

        });
        /**
         * 附件上传数据发送之前触发
         */
        uploader.on('uploadBeforeSend', function(object,data,headers) {
            data["chunkSize"]   = this.options.chunkSize;           //发送每片大小到后端
            data["md5"]         = object.file.swordFileMd5;         //文件MD5
            data["filePath"]    = object.file.swordFilePath;        //文件路径
            data["attachmentId"]= object.file.swordFileId;        //文件ID
            data["fileDirId"]   = object.file.fileDirId;
        });
        /**
         * 当开始上传流程时触发。
         */
        uploader.on( 'uploadStart', function( file ) {
            simpleUpload.$uploadBody.hide();
            simpleUpload.$progress.show();
            simpleUpload.settings.onUploadStart.apply(simpleUpload,[file]);
        });
        /**
         * 上传过程中触发，携带上传进度。
         */
        uploader.on( 'uploadProgress', function( file, percentage ) {
            simpleUpload.$progress.find('div[class="progress-bar"]').css('width', percentage*95+5 +'%').html((percentage*95+5).toFixed(2) +'%');
        });
        /**
         * 当文件上传出错时触发。
         */
        uploader.on( 'uploadError', function( file, reason ) {
            simpleUpload.settings.onUploadError.apply(simpleUpload,[file]);
        });
        /**
         * 当文件上传成功时触发。
         */
        uploader.on( 'uploadSuccess', function( file, response ) {
            simpleUpload.file = file;
            simpleUpload.settings.onUploadSuccess.apply(simpleUpload,[file]);
            simpleUpload.renderSavedFile(file);
        });
        /**
         * 不管成功或者失败，文件上传完成时触发。
         */
        uploader.on('uploadComplete',function(file){

        });

        uploader.on('error',function(errorType,file){
            if(file.size == 0){
                Alert({
                	message: '不能上传大小为0的文件<code>' + file.name + '</code>'
                });
            }
        });

        return uploader;
    };

    return {
        init:init
    }
});