package com.css.base.demo.service;


import com.css.base.demo.dao.entity.ApprovalTemplate;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
public interface IApprovalTemplateService {
    public List<ApprovalTemplate> listApprovalTemplates(String userId) throws Exception;
    public Page<ApprovalTemplate> listApprovalTemplates(String userId, String opinion, int curPage, int pageSize) throws Exception;
    public ApprovalTemplate getApprovalTemplate(String id) throws Exception;
    public void saveApprovalTemplate(ApprovalTemplate approvalTemplate) throws Exception;
    public void deleteApprovalTemplates(List<String> ids) throws Exception;
}
