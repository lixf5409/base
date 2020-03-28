define(['WebUploader', 'PDUtilDir/alert'],function(WebUploader, Alert){
    /**
     * 附件MD5、分片是否传过验证、文件上传完毕事件注册
     */
    var register = function(Upload){
        //先清除事件注册
        unRegister();

        var UPLOAD_FILE = null;
        WebUploader.Uploader.register({
            'name': 'beforeSendFile',
            'before-send-file': function(file) {

                //由于是全局注册，如果不是单附件上传或多附件上传，其它使用到WebUploader的上传直接跳出
                if(!file.isUploadComponent){
                    //这里之所以不用deferred.reject()，是因为经测试这样会发生浏览器假死
                    return false;
                }

                var deferred = WebUploader.Deferred();
                var start = new Date().getTime();
                var owner = this.owner;
                owner.md5File( file.source )
                    .progress(function(percentage){
                        if(file.swordFileStatus=="cancel"){
                            deferred.reject();
                        }
                        file.swordProgress.css('width', percentage*5 +'%').html((percentage*5).toFixed(2) +'%');
                    })
                    .fail(function() {
                        deferred.reject();
                    })
                    .then(function( md5 ) {
                        //MD5计算完毕，向服务器端验证该文件上传状态（未上传[包含已上传一部分]、成功）
                        //console.log("总耗时: "+((new Date().getTime()) - start)/1000);
                        $.ajax({
                            url:getControllerPath() + "/UploadChunkController/attachment/beforeSendFile",
                            dataType: 'json',
                            data: {
                            	attachmentMd5: md5,
                            	attachmentName:file.name,
                                fileMiddleDir:Upload.settings.fileMiddleDir,
                                isFast:Upload.settings.allowMC,                //是否允许秒传
                                attachmentSize:file.size,
                                extendInfo:(file.extendInfo?file.extendInfo:""),
                                fileDirId:Upload.settings.fileDirId
                            },
                            success: function (response) {
                                //未配置附件配置
                                if(response.status == "noConfig"){
                                    Alert({
                                    	message: '未找到附件配置，中断上传'
                                    });
                                    deferred.reject();
                                }else{
                                    //应用模块保存使用
                                    file.swordFileId      = response.data.file.attachmentId;
                                    //每次向后台发送分片时使用
                                    file.swordFileMd5     = md5;
                                    file.swordFilePath    = response.data.file.attachmentPath;
                                    file.fileDirId        = Upload.settings.fileDirId;

                                    //已经上传，跳过此文件，秒传
                                    if(response.status=="completed"){
                                        owner.skipFile(file);
                                    }else{
                                        UPLOAD_FILE = response.data;
                                    }
                                    //webuploader接着往下走。
                                    deferred.resolve();
                                }
                            }
                        });
                    });

                return deferred.promise();
            }
        });
        WebUploader.Uploader.register({
            'name': 'beforeSend',
            'before-send': function(block){
                //由于是全局注册，如果不是单附件上传或多附件上传，其它使用到WebUploader的上传直接跳出
                if(!UPLOAD_FILE){
                    return false;
                }

                //是否上传分片验证
                var checkBlock = function(){
                    for(var i= 0,chunk;chunk=UPLOAD_FILE.chunks[i++];){
                        if(chunk.chunk==block.chunk){
                            return true;
                        }
                    }
                    return false;
                };
                var deferred = WebUploader.Deferred();
                if(!UPLOAD_FILE.chunks){
                    //第一次上传,或者已经上传过但没有任何分片上传成功
                    deferred.resolve();
                }else{
                    if(checkBlock()){
                        //已经存在的分片跳过上传
                        deferred.reject();
                    }else{
                        deferred.resolve();
                    }
                }

                return deferred.promise();
            }
        });
        WebUploader.Uploader.register({
            'name': 'afterSendFile',
            'after-send-file': function(file){
                //由于是全局注册，如果不是单附件上传或多附件上传，其它使用到WebUploader的上传直接跳出
                if(!file.isUploadComponent){
                    return false;
                }

                //上传完成修改状态
                $.ajax({
                    url:getControllerPath() + "/UploadChunkController/attachment/afterSendFile",
                    dataType: 'json',
                    data: {
                    	attachmentId:file.swordFileId,
                        attachmentMd5:file.swordFileMd5,
                        attachmentPath:file.swordFilePath,
                        fileDirId:Upload.settings.fileDirId
                    },
                    success: function (response) {
                        if(response.success){
                            //用完立即清空全局变量，避免数据错误
                            UPLOAD_FILE = null;
                        }
                    }
                });
            }
        });
    };

    /**
     * 取消注册
     */
    var unRegister = function(){
        WebUploader.Uploader.unRegister('beforeSendFile');
        WebUploader.Uploader.unRegister('beforeSend');
        WebUploader.Uploader.unRegister('afterSendFile');
    };

    /**
     * 获取已经上传的附件
     * @param ids
     * @returns {*}
     */
    var getSavedFiles = function(ids){
        var result;
        $.ajax({
            url: getControllerPath() + "/UploadChunkController/attachment/getFilesByIds",
            type: "post",
            dataType: "json",
            async: false,
            data: {
                ids: ids.join(";")
            },
            success: function(files){
                result = files;
            }
        });
        return result;
    };

    /**
     * 附件上传组件配置
     * @param param
     */
    var getUploadConfig = function(param){
        var uploadConfig = {
            swf: getStaticPath() + '/modules/webuploader/Uploader.swf',
            server: getControllerPath() +"/UploadChunkController",
            auto: false,
            chunked:true
        };
        param.hasOwnProperty("fileNumLimit") && (uploadConfig.fileNumLimit = param.fileNumLimit);
        param.hasOwnProperty("fileSizeLimit") && (uploadConfig.fileSizeLimit = param.fileSizeLimit);
        param.hasOwnProperty("fileSingleSizeLimit")&& (uploadConfig.fileSingleSizeLimit = param.fileSingleSizeLimit);
        param.hasOwnProperty("accept") && (uploadConfig.accept = param.accept);
        return uploadConfig;
    };

    return {
        register:register,
        unRegister:unRegister,
        getSavedFiles:getSavedFiles,
        getUploadConfig:getUploadConfig
    }
});