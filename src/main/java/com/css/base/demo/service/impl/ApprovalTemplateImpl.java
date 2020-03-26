package com.css.base.demo.service.impl;


import com.css.base.demo.common.utils.DateUtils;
import com.css.base.demo.common.utils.ToolUtils;
import com.css.base.demo.common.utils.UUIDGenerator;
import com.css.base.demo.dao.repository.IApprovalTemplateNativeRepository;
import com.css.base.demo.dao.repository.IApprovalTemplateRepository;
import com.css.base.demo.service.IApprovalTemplateService;
import com.css.base.demo.viewobjects.WfmApprovalTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
@Service("approvalTemplateLogic")
public class ApprovalTemplateImpl implements IApprovalTemplateService {
    @Autowired
    IApprovalTemplateRepository approvalTemplateRepository;
    @Autowired
    IApprovalTemplateNativeRepository approvalTemplateNativeRepository;
    public List<WfmApprovalTemplate> listApprovalTemplates(String userId) throws Exception {
        return approvalTemplateRepository.listApprovalTemplates(userId);
    }
    public Page<WfmApprovalTemplate> listApprovalTemplates(String userId, String opinion, int curPage, int pageSize) throws Exception {
        return approvalTemplateNativeRepository.queryApprovalTemplates(userId,opinion,curPage,pageSize);
    }
    public WfmApprovalTemplate getApprovalTemplate(String id) throws Exception {
        return approvalTemplateRepository.getOne(id);
    }
    public void saveApprovalTemplate(WfmApprovalTemplate approvalTemplate) throws Exception {
        if(ToolUtils.isEmpty(approvalTemplate.getId())) {
            approvalTemplate.setId(UUIDGenerator.getUUID());
            approvalTemplate.setCreatetime(DateUtils.getCurrentTimestamp());
            approvalTemplate.setUpdatetime(DateUtils.getCurrentTimestamp());
        }else{
            approvalTemplate.setUpdatetime(DateUtils.getCurrentTimestamp());
        }
        approvalTemplateRepository.save(approvalTemplate);
    }
    public void deleteApprovalTemplates(List<String> ids) throws Exception {
        approvalTemplateRepository.deleteApprovalTemplates(ids);
    }

}
