package com.css.base.demo.dao.mapper;


import com.css.base.demo.dao.entity.WfmApprovalTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
@Mapper()
@Repository("approvalTemplate")
public interface approvalTemplateMapper {
    public void persist(WfmApprovalTemplate approvalTemplate) throws Exception;
    public List<WfmApprovalTemplate> listApprovalTemplates(String userId) throws Exception;
    public List<WfmApprovalTemplate> queryApprovalTemplates(String userId, String opinion) throws Exception;
    public WfmApprovalTemplate getApprovalTemplate(String id) throws Exception;
    public void deleteApprovalTemplates(List<String> ids) throws Exception;
}
