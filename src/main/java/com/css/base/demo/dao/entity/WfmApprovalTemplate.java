package com.css.base.demo.dao.entity;


import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Created by lixiaofeng on 2015/4/7.
 */
public class WfmApprovalTemplate implements Serializable {
    /**
     * 意见模板id
     */
    private String id;
    /**
     * 用户id
     */
    private String userId;
    /**
     * 常用意见
     */
    private String opinion;
    /**
     * 排序序号
     */
    private Integer sort;
    /**
     * 创建时间
     */
    private Timestamp createtime;
    /**
     * 修改时间
     */
    private Timestamp updatetime;
    /**
     * 最后使用时间
     */
    private Timestamp usedtime;
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOpinion() {
        return opinion;
    }

    public void setOpinion(String opinion) {
        this.opinion = opinion;
    }

    public Integer getSort() {
        return sort;
    }

    public void setSort(Integer sort) {
        this.sort = sort;
    }

    public Timestamp getCreatetime() {
        return createtime;
    }

    public void setCreatetime(Timestamp createtime) {
        this.createtime = createtime;
    }

    public Timestamp getUpdatetime() {
        return updatetime;
    }

    public void setUpdatetime(Timestamp updatetime) {
        this.updatetime = updatetime;
    }

    public Timestamp getUsedtime() {
        return usedtime;
    }

    public void setUsedtime(Timestamp usedtime) {
        this.usedtime = usedtime;
    }


    @Override
    public String toString(){
        String indent = ".";
        StringBuffer sb = new StringBuffer();
        sb.append(getClass().getName() +":");
        sb.append(" id=" + id);
        sb.append("\n" + indent + "userId=" + userId);
        sb.append("\n" + indent + "opinion=" + opinion);
        sb.append("\n" + indent + "sort=" + sort);
        sb.append("\n" + indent + "createtime=" + createtime);
        sb.append("\n" + indent + "updatetime=" + updatetime);
        sb.append("\n" + indent + "usedtime=" + usedtime);
        sb.append("\n");
        return sb.toString();
    }
}

