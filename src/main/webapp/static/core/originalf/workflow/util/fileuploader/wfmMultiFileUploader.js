define(['WebUploader',
    'PDUtilDir/fileupload/fileUpload',
    'PDUtilDir/alert',
    'PDUtilDir/confirm',
    'css!WebUploaderCss',
    'css!static/core/originalf/workflow/util/fileuploader/wfmUploadCss'
    ], function(WebUploader, UploadUtil, Alert, Confirm){

    /**
     * 附件上传控件初始化
     * @param options
     */
    var init = function(options){
        var settings = {
            placeAt: "",                                      //附件上传组件所放位置
            allowDelete: true,                                //是否允许删除文件
            allowPhyDelete: true,                             //允许物理删除
            allowUpload: true,                                //是否允许上传文件
            allowDownload: true,                              //是否允许下载
            allowMC: true,                                    //是否允许秒传
            //renameFile:true,                                 //重命名文件（开启后物理文件会去掉后缀已经文件名被修改）
            fileMiddleDir: "",
            //onUploadedFile:function(file,savedFilesId){},  //上传成功扩展(0.9.7版本弃用，用onUploadSuccess替换)
            //onDeletedFile:function(file,savedFilesId){},
            extendColumn: [],
            uploadBtnName:"上传附件",
            onDeleteUploadingFile: function(file){},
            onDeleteSavedFile: function(file){},
            onBeforeFileQueued: function(file){
            	return true;
            },
            onUploadStart: function(file){},
            onUploadError: function(file){},
            onUploadSuccess: function(file){},
            uploadConfig: UploadUtil.getUploadConfig(options), //附件上传配置
            //文件存储路径ID
            fileDirId: ""
        };
        settings.uploadConfig.auto = true;
        return result(new Upload($.extend(true, settings, options)).render());
    };

    /**
     * 对返回API进行控制
     * @param upload
     */
    function result(upload){
        //从附件行对象中拿到file对象
        var getFile = function(list){
            var arr = [];
            for(var i=0,item; item=list[i++];){
                arr.push(item.file)
            }
            return arr;
        };
        
        //获取待上传附件列表
        var getQueuedFiles = function(){
            return getFile(upload.queuedFiles)
        };
        
        //获取已上传附件列表
        var getSavedFiles = function(){
            return getFile(upload.savedFiles)
        };
        
        //获取已删除上传成功附件列表
        var getDeletedSavedFiles = function(){
            return getFile(upload.deletedSavedFiles)
        };
        
        //获取文件统计信息
        var getStats = function() {
            var result = {
                progressNum: 0,          //正在上传中的附件数量
                queueNum: 0              //待上传的附件数量
            };
            //不允许上传附件时，webUploader对象为null
            if(upload.webUploader){
                var stats = upload.webUploader.getStats();
                result.progressNum = stats.progressNum;
                result.queueNum = upload.queuedFiles.length;
            }
            return result;
        };

        return {
            getStats: getStats,
            getQueuedFiles: getQueuedFiles,
            getSavedFiles: getSavedFiles
            //getDeletedSavedFiles:getDeletedSavedFiles
        }
    }


    /********************************Upload对象**********************************/
    /**
     * 附件上传组件对象
     * @param settings
     */
    function Upload(settings){
        this.webUploader    = null;         //WebUploader对象
        this.queuedFiles    = [];           //待上传文件数组
        this.savedFiles     = [];           //已上传文件数组
        this.deletedSavedFiles = [];          //已删除的上传成功附件
        this.$container     = "";           //整个上传组件DOM对象
        this.$toolbar       = "";           //操作栏DOM对象
        this.$table         = "";           //文件列表DOM对象
        this.$status        = "";           //状态栏DOM对象
        this.settings       = settings;
    }
    /**
     * 渲染附件上传组件
     */
    Upload.prototype.render = function(){
        this.container      = $('<div class="wfm-upload"></div>');
        //添加附件上传组件到指定位置
        var placeAt     = this.settings.placeAt;
        var $placeAt    = typeof(placeAt)=="string" ? $("#"+placeAt) : $(placeAt);
        $placeAt.append(this.container);
        this.$container  = this.container;
        //允许上传附件时才渲染操作栏
        if(this.settings.allowUpload){
            var _this = this;
            this.$uploadBtn = $('#'+this.settings.uploadBtnId).append("<a><i class='fa fa-cloud-upload'>&nbsp;</i>"+this.settings.uploadBtnName+"</a>");
            //设置添加按钮
            this.settings.uploadConfig.pick  = this.$uploadBtn;
            //初始化WebUploader
            this.webUploader    = InitUploader(this,this.settings.uploadConfig);
        }

        //渲染已上传的附件
        var savedFileIds = this.settings.data;
        if(savedFileIds){
            var files = UploadUtil.getSavedFiles(savedFileIds);
            this.renderSavedFiles(files);
        }

        return this;
    };
     /**
     * 渲染已上传的附件
     * @param ids
     */
    Upload.prototype.renderSavedFiles = function(files){
        var _this = this;
        for(var i=0,file; file=files[i++];){
            _this.savedFiles.push(new FileObj(_this, _this.webUploader, file, true));
        }
    };


    /**
     * 附件控件清空
     */
    /*Upload.prototype.clear = function(){
        this.queuedFiles    = [];
        this.savedFiles     = [];
        this.webUploader.reset();
        this.$table.find("tr").not(":first").remove();
    };*/



    /********************************File对象**********************************/
    /**
     * 文件对象
     * @param upload        文件上传组件对象
     * @param webUploader   Webuploader对象
     * @param file          Webuploader中的file对象，包含文件名称、大小等信息
     * @param saved         标识是新上传还是已上传的文件
     * @constructor
     */
    function FileObj(upload, webUploader, file, saved){
        this.Upload     = upload;               //附件上传组件对象
        this.webUploader = webUploader;          //WebUploader对象
        this.file       = file;                 //Webuploader中的file对象
        this.saved      = saved;                //标识当前文件的状态已上传
        //this.responseData= null;                //文件所对应的后端数据信息
        this.$tr        = "";                   //文件行DOM对象
        this.$status    = "";                   //状态DOM对象
        this.$operation = null;                 //操作DOM对象
        this.$del       = null;
        this.renderSavedFiles()
    }

    /**
     * 渲染已经上传的附件，适用于已保存的表单编辑
     */
    FileObj.prototype.renderSavedFiles = function(){
        var file = this.file;
        var href = getServer()+'/sword?SwordControllerName=hg-fileDownload&id='+file.swordFileId;
        var aHtml= '<a href="'+href+'" title="'+file.name+'">'+ file.name +'</a>';
        //是否允许下载控制
        if(!this.Upload.settings.allowDownload){
            aHtml= file.name;
        }
        var html = '<span class="wfm-upload-span">'+aHtml+'</span>';
        this.$span = $(html);


        var _this       = this;

        //已上传附件是否允许删除控制
        if(this.Upload.settings.allowDelete){
            this.$del   = $('<i class="glyphicon glyphicon-remove"></i>').bind('click',function(){_this.remove()});
            this.$span.append(this.$del);
        }

        this.Upload.$container.append(this.$span);
    };

    /**
     * 文件删除
     */
    FileObj.prototype.remove = function(){
        if(this.saved){
            //真删除与软删除
            this.Upload.settings.allowPhyDelete ? deletePhyFile(this) : deletePhyFileSuccess(this);
        }else{
            deleteFrontFile(this);
        }
    };

    /**
     * 删除附件的前端UI部分，相关操作封装抽取
     * @param fileObj
     */
    function deleteFrontFile(fileObj){
        var _this = fileObj;

        //删除正在上传中的附件
        if(_this.webUploader.isInProgress()){
            _this.file.swordFileStatus = "cancel";                  //计算MD5时使用
            _this.Upload.settings.onDeleteUploadingFile.apply(_this,[_this.file]);
            //标记文件状态为已取消, 同时将中断文件传输。
            _this.webUploader.cancelFile(_this.file);
        }
        //从待上传队列中移除
        delFileFormList(_this.file.name,_this.Upload.queuedFiles);
        //从已上传队列中移除
        delFileFormList(_this.file.name,_this.Upload.savedFiles);
        //移除附件行UI
        _this.$span.remove();
        //存在id则认为是本次request请求范围内上传成功的附件，不存在则认为是之前会话上传的附件
        _this.file.id && _this.webUploader.removeFile(_this.file,true);
    }

    /**
     * 删除物理文件
     * @param fileObj
     */
    function deletePhyFile(fileObj){
    	Confirm({
    		message: '是否从服务器中删除该附件?',
    		events: {
    			onConfirm: function(){
        			$.ajax({
                        url: getControllerPath() + "/UploadChunkController/attachment/delFile",
                        dataType: 'json',
                        data: {
                            id: fileObj.file.swordFileId
                        },
                        success: function (response) {
                            if(response.success){
                                deletePhyFileSuccess(fileObj);
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
    }

    /**
     * 物理文件删除成功后调用
     * @param FileObj
     */
    function deletePhyFileSuccess(FileObj){
        var _this = FileObj;
        //附件删除Web相关操作
        deleteFrontFile(_this);
        //已上传的文件删除时，调用回调
        _this.Upload.settings.onDeleteSavedFile.apply(_this,[_this.file]);
        //把附件行对象放入已删除数组中
        if(!checkFileFormSavedList(_this.file.swordFileId,_this.Upload.deletedSavedFiles)){
            _this.Upload.deletedSavedFiles.push(_this);
        }
    }


    /********************************WebUploader相关**********************************/
    var InitUploader = function(Upload, config) {
        var _FileObj = FileObj;
        //开启断点续传
        if(config.chunked == true){
            UploadUtil.register(Upload);
        }
        var uploader = WebUploader.create(config);

        //当文件被加入队列以后触发。
        uploader.on('beforeFileQueued', function (file) {
            //判断是否在待上传列表中
            if(getFileFromList(file.name, Upload.savedFiles)){
                Alert({
                	message: '<code>' + file.name + '</code>已经上传'
                });
                return false;
            }
            file.swordProgress = $("#progress-bar");
            var result = Upload.settings.onBeforeFileQueued.apply(Upload, [file]);
            return result;
        });
        /**
         * 当一批文件添加进队列以后触发。
         */
        uploader.on( 'filesQueued', function( files ) {
            //判断待上传列表中是否已经存在相同的待上传附件
            var queuedFiles = Upload.queuedFiles;
            for(var i= 0,file;file=files[i++];){
                var FileObj =  new _FileObj(Upload, uploader, file);
                queuedFiles.push(FileObj);

                //公共事件部分判断是否来自于附件上传组件
                file.isUploadComponent = true;
            }
        });
        /**
         * 附件上传数据发送之前触发
         */
        uploader.on('uploadBeforeSend', function(object,data,headers) {
            data["chunkSize"]   = this.options.chunkSize;               //发送每片大小到后端
            data["md5"]         = object.file.swordFileMd5;             //文件MD5
            data["filePath"]    = object.file.swordFilePath;            //文件路径
            data["attachmentId"]= object.file.swordFileId;        //文件ID
            data["fileDirId"]   = object.file.fileDirId;
        });
        /**
         * 当开始上传流程时触发。
         */
        uploader.on( 'uploadStart', function( file ) {
            //找到当前待上传文件对象
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            Upload.settings.onUploadStart.apply(Upload,[file]);
        });
        
        /**
         * 上传过程中触发，携带上传进度。
         */
        uploader.on( 'uploadProgress', function(file, percentage) {
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
        });
        
        /**
         * 当文件上传出错时触发。
         */
        uploader.on( 'uploadError', function( file, reason ) {
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            queuedFile && queuedFile.$status.empty().append('上传失败');
        });
        
        /**
         * 当文件上传成功时触发。
         */
        uploader.on( 'uploadSuccess', function( file, response ) {
            var queuedFile = getFileFromList(file.name, Upload.queuedFiles);
            //保存后端返回的数据
            //queuedFile.responseData = response;
            //添加到已上传列表中
            Upload.savedFiles.push(queuedFile);
            //从待上传中删除
            delFileFormList(file.name, Upload.queuedFiles);

            //设置成功状态

            queuedFile.saved = true;

            //设置下载链接
            var $a = $('<a></a>')
                .attr('href',getControllerPath()+'/DownloadController?attachmentId='+file.swordFileId)
                .attr('title',file.name);
            var $span = queuedFile.$span;
            $span.empty().append($a.text(file.name));
            var $del   = $('<i class="glyphicon glyphicon-remove"></i>').bind('click',function(){
                queuedFile.remove();
            });
            $span.append($del);

            //全部上传完成回调
            Upload.settings.onUploadSuccess.apply(Upload,[file]);
        });
        
        /**
         * 不管成功或者失败，文件上传完成时触发。
         */
        uploader.on('uploadComplete',function(file){

        });

        uploader.on('error', function(errorType, file){
            console.log(arguments);
            if(file.size == 0){
                Alert({
                	message: '不能上传大小为0的文件<code>' + file.name + '</code>'
                });
            }
        });

        return uploader;
    };

    /********************************内部私有工具方法**********************************/
    /**
     * 根据文件名从指定的数组中找出文件对象
     * @param fileName
     * @param list
     * @returns fileObj
     */
    function getFileFromList(fileName, list) {
        var tmp = null;
        $(list).each(function(index,entry){
            if( entry.file.name.toLowerCase() === fileName.toLowerCase() ) {
                tmp = entry;
            }
        });
        return tmp;
    }


    /**
     * 根据文件名从指定的数组中删除文件对象
     * @param fileName
     * @param list
     */
    function delFileFormList(fileName, list){
        $(list).each(function(index,entry){
            if( entry.file.name.toLowerCase() === fileName.toLowerCase() ) {
                list.splice(index, 1);
                return false;
            }
        });
    }


    function getSavedFilesId(savedFiles){
        var savedFilesId = [];
        for(var i= 0,fileObj;fileObj=savedFiles[i++];){
            savedFilesId.push(fileObj.file.swordFileId);
        }
        return savedFilesId;
    }

    function checkFileFormSavedList(id,list){
        for(var i= 0,item;item=list[i++];){
            if(item.file.swordFileId==id){
                return true
            }
        }
        return false;
    }

    return {
        init: init
    }
});