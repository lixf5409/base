package com.css.base.demo.dao.repository;


import com.css.base.demo.viewobjects.WfmApprovalTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
@Repository("approvalTemplateRepository")
public interface IApprovalTemplateRepository extends JpaRepository<WfmApprovalTemplate,String> {
    @Query("from ApprvalTemplate where userId = ?1")
    public List<WfmApprovalTemplate> listApprovalTemplates(String userId) throws Exception;

    @Modifying
    @Query("delete from ApprovalTemplate where id in (?1)")
    public void deleteApprovalTemplates(List<String> ids) throws Exception;
}
