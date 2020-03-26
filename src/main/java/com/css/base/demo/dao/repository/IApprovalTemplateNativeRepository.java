package com.css.base.demo.dao.repository;


import com.css.base.demo.dao.entity.ApprovalTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
@Repository("approvalTemplateRepositoryNative")
public interface IApprovalTemplateNativeRepository {
    public Page<ApprovalTemplate> queryApprovalTemplates(String userId, String opinion, int curPage, int pageSize) throws Exception;
}
