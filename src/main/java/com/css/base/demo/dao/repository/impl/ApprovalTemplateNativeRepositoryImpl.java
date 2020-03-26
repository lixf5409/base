package com.css.base.demo.dao.repository.impl;


import com.css.base.demo.common.utils.ToolUtils;
import com.css.base.demo.dao.entity.ApprovalTemplate;
import com.css.base.demo.dao.repository.IApprovalTemplateNativeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.util.List;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
public class ApprovalTemplateNativeRepositoryImpl implements IApprovalTemplateNativeRepository {
    @PersistenceContext
    EntityManager entityManager;
    public Page<ApprovalTemplate> queryApprovalTemplates(String userId, String opinion, int curPage, int pageSize) throws Exception{
        StringBuilder sql = new StringBuilder("select * from wfm_approvaltemplate ");
        StringBuilder whereSql = new StringBuilder("where userId=? ");
        if(!ToolUtils.isEmpty(opinion)){
            sql.append(" and opinion like ?");
        }
        StringBuilder orderSql = new StringBuilder(" order by sort");

        Query query = entityManager.createNativeQuery(sql.append(whereSql).append(orderSql).toString(),ApprovalTemplate.class);
        query.setParameter(1,userId);
        if(!ToolUtils.isEmpty(opinion)){
            query.setParameter(2,opinion);
        }
        Query countQuery = entityManager.createQuery(sql.append(whereSql).toString(),Long.class);
        Long count = (Long) countQuery.getSingleResult();
        query.setFirstResult(curPage);
        query.setMaxResults(pageSize);
        List<ApprovalTemplate> list = query.getResultList();
        Pageable pageable = PageRequest.of(curPage,pageSize);
        Page<ApprovalTemplate> approvalTemplates = new PageImpl<ApprovalTemplate>(list, pageable, count);
        return approvalTemplates;
    }
}
