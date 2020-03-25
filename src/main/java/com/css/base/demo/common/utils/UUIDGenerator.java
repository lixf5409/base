package com.css.base.demo.common.utils;



import java.util.UUID;

/**
 * Created by lixiaofeng on 2015/4/13.
 */
public class UUIDGenerator {
    /**
     * 生成32位的uuid串
     * @return
     */
    public static String getUUID(){
        return UUID.randomUUID().toString().replace("-", "");
    }
}