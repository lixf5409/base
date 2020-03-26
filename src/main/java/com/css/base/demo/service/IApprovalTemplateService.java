package com.css.base.demo.service;


import com.css.base.demo.viewobjects.WfmApprovalTemplate;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
public interface IApprovalTemplateService {
    public List<WfmApprovalTemplate> listApprovalTemplates(String userId) throws Exception;
    public Page<WfmApprovalTemplate> listApprovalTemplates(String userId, String opinion, int curPage, int pageSize) throws Exception;
    public WfmApprovalTemplate getApprovalTemplate(String id) throws Exception;
    public void saveApprovalTemplate(WfmApprovalTemplate approvalTemplate) throws Exception;
    public void deleteApprovalTemplates(List<String> ids) throws Exception;
}
