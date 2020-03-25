package com.css.base.demo.common.utils;


import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class ToolUtils {
	public static boolean isEmpty(Object obj){
		return obj == null;
	}
	
	
	public static boolean isEmpty(Object[] obj){
		return obj==null || obj.length==0;
	}
	/**
	 * 判断字符串是否为空，null、""、"null"、" "返回true，其他返回false,
	 * @param str
	 * @return
	 */
	public static boolean isEmpty(String str){
		return str == null || "".equals(str) || "null".equalsIgnoreCase(str) || "".equals(str.trim());
	}
	/**
	 * 判断map是否为空，如果map为null或者empty返回true,其他返回false
	 * @param map
	 * @return
	 */
	public static boolean isEmpty(Map map){
		return map == null || map.isEmpty();
	}
	/**
	 * 判断collection是否为空，如果collection为null或者empty返回true,其他返回false
	 * @param collection
	 * @return
	 */
	public static boolean isEmpty(Collection collection){
		return collection == null || collection.isEmpty();
	}


	public static String getRootOrgName() {
//		ProjectInfo info = OriginalProject.getProjectInfo();
		//TODO 先写死
//		return info.getOrgName();
        return "中国软件与技术服务股份有限公司";
	}
	public static <T> T[] list2Array(Class<T> type, List<T> list){
	    T[] array = (T[]) Array.newInstance(type,list.size());
        array = list.toArray(array);
	    return (T[])array;
    }
    public static void main(String[] args){
	    List<String> ids = new ArrayList<String>();
	    ids.add("11");
	    ids.add("22");
	    String[] idarrays = list2Array(String.class,ids);
	    for(int i=0;i<idarrays.length;i++){
	        System.out.println(idarrays[i]);
        }
    }
}
