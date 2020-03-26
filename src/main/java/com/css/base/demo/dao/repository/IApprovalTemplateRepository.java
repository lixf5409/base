package com.css.base.demo.dao.repository;


import com.css.base.demo.dao.entity.ApprovalTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
@Repository("approvalTemplateRepository")
public interface IApprovalTemplateRepository extends JpaRepository<ApprovalTemplate,String> {
    @Query("from ApprovalTemplate where userId = ?1")
    public List<ApprovalTemplate> listApprovalTemplates(String userId) throws Exception;

    @Modifying
    @Transactional
    @Query("delete from ApprovalTemplate where id in (?1)")
    public void deleteApprovalTemplates(List<String> ids) throws Exception;
}
