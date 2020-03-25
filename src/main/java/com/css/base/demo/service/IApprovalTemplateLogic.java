package com.css.base.demo.service;


import com.css.base.demo.dao.entity.WfmApprovalTemplate;
import com.github.pagehelper.PageInfo;

import java.util.List;
import java.util.Map;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
public interface IApprovalTemplateLogic {
    public List<WfmApprovalTemplate> listApprovalTemplates(String userId) throws Exception;
    public PageInfo<WfmApprovalTemplate> listApprovalTemplates(String userId, int curPage, int pageSize, String opinion) throws Exception;
    public WfmApprovalTemplate getApprovalTemplate(String id) throws Exception;
    public void saveApprovalTemplate(WfmApprovalTemplate approvalTemplate) throws Exception;
    public void deleteApprovalTemplates(List<String> ids) throws Exception;
}
