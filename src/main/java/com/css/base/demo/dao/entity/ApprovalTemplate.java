package com.css.base.demo.dao.entity;


import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;


/**
 * The persistent class for the wfm_formconfig database table.
 *
 */
@Entity
@Table(name="wfm_approvaltemplate")
public class ApprovalTemplate implements Serializable {
	@Id
	private String id;
	@Column(name="userid")
	private String userId;
    @Column(name="opinion")
	private String opinion;
	@Column(name="sort")
	private Integer sort;
	@Column(name="createtime")
	private Timestamp createtime;
	@Column(name="updatetime")
	private Timestamp updatetime;
	@Column(name="usedtime")
	private Timestamp usedtime;
	@Column(name="type")
	private String type;

	public ApprovalTemplate() {
	}

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

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
}
