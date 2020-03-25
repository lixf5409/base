package com.css.base.demo.service.impl;


import com.css.base.demo.common.utils.DateUtils;
import com.css.base.demo.common.utils.ToolUtils;
import com.css.base.demo.common.utils.UUIDGenerator;
import com.css.base.demo.dao.mapper.approvalTemplateMapper;
import com.css.base.demo.service.IApprovalTemplateLogic;
import com.css.base.demo.dao.entity.WfmApprovalTemplate;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
@Service("approvalTemplateLogic")
public class ApprovalTemplateLogic implements IApprovalTemplateLogic {
    private volatile static IApprovalTemplateLogic instance;

    private ApprovalTemplateLogic() {
    }
    @Autowired
    approvalTemplateMapper approvalTemplatePersistence;
    public static IApprovalTemplateLogic getInstance()  {
        if(null == instance){
            synchronized (ApprovalTemplateLogic.class) {
                if(null == instance){
                    instance = new ApprovalTemplateLogic();
                }
            }
        }
        return instance;
    }
    public List<WfmApprovalTemplate> listApprovalTemplates(String userId) throws Exception {
        return approvalTemplatePersistence.listApprovalTemplates(userId);
    }
    public PageInfo<WfmApprovalTemplate> listApprovalTemplates(String userId, int curPage, int pageSize, String opinion) throws Exception {
        PageHelper.startPage(curPage, pageSize);
        List<WfmApprovalTemplate> list = approvalTemplatePersistence.queryApprovalTemplates(userId,opinion);
        PageInfo<WfmApprovalTemplate> pageInfo =  new PageInfo<WfmApprovalTemplate>(list);
        return pageInfo;
    }
    public WfmApprovalTemplate getApprovalTemplate(String id) throws Exception {
        return approvalTemplatePersistence.getApprovalTemplate(id);
    }
    public void saveApprovalTemplate(WfmApprovalTemplate approvalTemplate) throws Exception {
        if(ToolUtils.isEmpty(approvalTemplate.getId())) {
            approvalTemplate.setId(UUIDGenerator.getUUID());
            approvalTemplate.setCreatetime(DateUtils.getCurrentTimestamp());
            approvalTemplate.setUpdatetime(DateUtils.getCurrentTimestamp());
        }else{
            approvalTemplate.setUpdatetime(DateUtils.getCurrentTimestamp());
        }
        approvalTemplatePersistence.persist(approvalTemplate);
    }
    public void deleteApprovalTemplates(List<String> ids) throws Exception {
        approvalTemplatePersistence.deleteApprovalTemplates(ids);
    }

}
