package com.css.base.demo.service.impl;


import com.css.base.demo.common.utils.DateUtils;
import com.css.base.demo.common.utils.ToolUtils;
import com.css.base.demo.common.utils.UUIDGenerator;
import com.css.base.demo.dao.mapper.ApprovalTemplateMapper;
import com.css.base.demo.service.IApprovalTemplateService;
import com.css.base.demo.dao.entity.WfmApprovalTemplate;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
@Service("approvalTemplateLogic")
public class ApprovalTemplateImpl implements IApprovalTemplateService {
    @Autowired
    ApprovalTemplateMapper approvalTemplateMapper;
    public List<WfmApprovalTemplate> listApprovalTemplates(String userId) throws Exception {
        return approvalTemplateMapper.listApprovalTemplates(userId);
    }
    public PageInfo<WfmApprovalTemplate> listApprovalTemplates(String userId, int curPage, int pageSize, String opinion) throws Exception {
        PageHelper.startPage(curPage, pageSize);
        List<WfmApprovalTemplate> list = approvalTemplateMapper.queryApprovalTemplates(userId,opinion);
        PageInfo<WfmApprovalTemplate> pageInfo =  new PageInfo<WfmApprovalTemplate>(list);
        return pageInfo;
    }
    public WfmApprovalTemplate getApprovalTemplate(String id) throws Exception {
        return approvalTemplateMapper.getApprovalTemplate(id);
    }
    public void saveApprovalTemplate(WfmApprovalTemplate approvalTemplate) throws Exception {
        if(ToolUtils.isEmpty(approvalTemplate.getId())) {
            approvalTemplate.setId(UUIDGenerator.getUUID());
            approvalTemplate.setCreatetime(DateUtils.getCurrentTimestamp());
            approvalTemplate.setUpdatetime(DateUtils.getCurrentTimestamp());
        }else{
            approvalTemplate.setUpdatetime(DateUtils.getCurrentTimestamp());
        }
        approvalTemplateMapper.persist(approvalTemplate);
    }
    public void deleteApprovalTemplates(List<String> ids) throws Exception {
        approvalTemplateMapper.deleteApprovalTemplates(ids);
    }

}
