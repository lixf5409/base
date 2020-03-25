package com.css.base.demo.common.utils;



import javax.servlet.http.HttpServletRequest;

public class LoginUtils {
    private static final String ORIGINAL_ADMIN_USER_ID = "c8f1ba6c7cf842409aba43206e9f7442";//originaladmin
	public static String getLoginUserId() {
		String userId =  "";
		if(ToolUtils.isEmpty(userId)){
            userId = ORIGINAL_ADMIN_USER_ID;
        }
		return userId;
	}

}
