define([],function(){
    var LANG_CN = "cn";
    var getWfmLang = function(){
        return LANG_CN;
    };
    var getLocaleObject = function(langJson){
        var locale =  getWfmLang();
        var localeObj = JSON.parse(langJson);
        return localeObj[locale];
    };
    var getWfmLangFileSuffix = function () {
        var locale =  getWfmLang();
        var suffix = "";
        if(locale != LANG_CN){
            suffix="_"+locale;
        }
        return suffix;
    };
    var getWfmLangStringAndReplaceBracePlaceholderByKey = function (langJson, key, paramArray) {
        var delim = "{}";
        if(key == undefined || key == null){
            return "";
        }
        var desString = langJson[key];
        if(desString == undefined || desString == null){
            return "";
        }
        if(paramArray == null || paramArray.length == 0){
            return desString;
        } else{
            var i = 0;
            var newString = "";
            for(var k=0; k<paramArray.length; k++) {
                var j = desString.indexOf(delim, i);
                if(j == -1){
                    break;
                } else {
                    if(j == 0){
                        newString = paramArray[k];
                    }else if(j == 1){
                        if(("\\"+delim) == desString.substring(0,3)){
                            newString = desString.substring(0,3);
                            k--;
                        } else {
                            newString = desString.substring(0,1) + paramArray[k];
                        }
                    } else {
                        if(("\\"+delim) == desString.substring(j-1,j+2) && ("\\\\"+delim) != desString.substring(j-2,j+2)){
                            newString = newString + desString.substring(i,j-1) + delim;
                            k--;
                        } else {
                            newString = newString + desString.substring(i,j-1) + paramArray[k];
                        }
                    }
                    i = j + 2;
                }
            }
            newString = newString + desString.substring(i);
            return newString;
        }
    };
    var getWfmLangStringAndReplaceUserDefinedPlaceholderByKey = function (langJson, key, paramArray) {
        if(key == undefined || key == null){
            return "";
        }
        var desString = langJson[key];
        if(desString == undefined || desString == null){
            return "";
        }
        if(paramArray == null || paramArray.length == 0){
            return desString;
        } else{
            for(var k=0; k<paramArray.length; k++) {
                if(paramArray[k] == "" || paramArray[k] == null){
                    continue;
                }
                var param = paramArray[k].split(":");
                if(param.length == 2){
                    desString = desString.replace(param[0], param[1]);
                }
            }
            return desString;
        }
    };
    var getLanguage = function(){
        var locale =  getWfmLang();
        var language = 'zh-cn';
        if (locale == 'en') {
            language = 'en';
        }
        return language;
    };

    return {
        getWfmLang:getWfmLang,
        getLocaleObject:getLocaleObject,
        getWfmLangFileSuffix:getWfmLangFileSuffix,
        getWfmLangStringAndReplaceBracePlaceholderByKey:getWfmLangStringAndReplaceBracePlaceholderByKey,
        getWfmLangStringAndReplaceUserDefinedPlaceholderByKey:getWfmLangStringAndReplaceUserDefinedPlaceholderByKey,
        getLanguage:getLanguage

    };
});