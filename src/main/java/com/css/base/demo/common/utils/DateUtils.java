package com.css.base.demo.common.utils;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;


public class DateUtils {
	/**
	 * 获取当前时间
	 * 
	 * @return
	 */
	public static Timestamp getCurrentTimestamp() {
		return new Timestamp(System.currentTimeMillis());
	}

	private static final String DEFAULT_PATTERN = "yyyyMMddHHmmss";
	public static final String H24_PATTERN = "yyyy-MM-dd HH:mm:ss";
	public static Timestamp date2Timestamp(Date date){
		if(date == null) {
			throw new IllegalArgumentException("date is null");
		}
		SimpleDateFormat sdf = new SimpleDateFormat(DEFAULT_PATTERN);
		String dateStr = sdf.format(date);
		return str2Timestamp(dateStr, DEFAULT_PATTERN);
	}

	/**
	 * @param time
	 * @param pattern
	 * @return
	 */
	public static String timestamp2str(Timestamp time, String pattern) {
		if (time == null) {
			throw new IllegalArgumentException("Timestamp is null");
		}
		if (pattern != null && !"".equals(pattern)) {
			checkPattern(pattern);
		} else {
			pattern = DEFAULT_PATTERN;
		}

		Calendar cal = Calendar.getInstance(TimeZone.getDefault());
		cal.setTime(time);
		SimpleDateFormat sdf = new SimpleDateFormat(pattern);
		return sdf.format(cal.getTime());
	}
	private static void checkPattern(String pattern) {
        if (!"yyyyMMddHHmmss".equals(pattern)
                && !"yyyy-MM-dd HH:mm:ss".equals(pattern)
                && !"yyyy-MM-dd".equals(pattern)
                && !"MM/dd/yyyy".equals(pattern)
                && !"yyyy-MM-dd hh:mm:ss".equals(pattern)
                && !"yyyyMMdd".equals(pattern)) {
            throw new IllegalArgumentException("Date format [" + pattern
                    + "] is invalid");
        }
    }
	public static Timestamp str2Timestamp(String timeStr, String pattern) {
		Timestamp result = null;
		if (timeStr == null) {
			throw new IllegalArgumentException("Timestamp is null");
		}
		if (pattern != null && !"".equals(pattern)) {
            checkPattern(pattern);
		} else {
			pattern = DEFAULT_PATTERN;
		}

		Date d = null;
		SimpleDateFormat sdf = new SimpleDateFormat(pattern);
		try {
			d = sdf.parse(timeStr);
			result = new Timestamp(d.getTime());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return result;
	}
	/**
	 * 
	 * @param time 时间
	 * @param duration +：之后；-：之前
	 * @param durationUnit 单位 Y:年 M:月 D:日 h:时m分 s:秒
	 * @return
	 * @throws Exception
	 */
	public static Timestamp calculateTime(Timestamp time, int duration, String durationUnit) {
		if(ToolUtils.isEmpty(duration )){
			return time;
		}
		int field;
		if ("Y".equals(durationUnit)) {
			field = Calendar.YEAR;
		}else if ("M".equals(durationUnit)) {
			field = Calendar.MONTH;
		}else if ("D".equals(durationUnit)) {
			field = Calendar.DAY_OF_MONTH;
		}else if ("h".equals(durationUnit)) {
			field = Calendar.HOUR_OF_DAY;
		}else if ("m".equals(durationUnit)) {
			field = Calendar.MINUTE;
		}else if ("s".equals(durationUnit)) {
			field = Calendar.SECOND;
		}else {
			return time;
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(time);
		cal.add(field, duration);
		return new Timestamp(cal.getTime().getTime());
	}

    /**
     * 根据 年、月 获取对应的月份 的 天数
     */
    public static int getDaysByYearMonth(int year, int month) {
        Calendar a = Calendar.getInstance();
        a.set(Calendar.YEAR, year);
        a.set(Calendar.MONTH, month - 1);
        a.set(Calendar.DATE, 1);
        a.roll(Calendar.DATE, -1);
        int maxDate = a.get(Calendar.DATE);
        return maxDate;
    }
}
