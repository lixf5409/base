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
import java.math.BigInteger;
import java.util.List;

/**
 * Created by lixiaofeng on 2015/4/14.
 */
@Repository("approvalTemplateRepositoryNative")
public class ApprovalTemplateNativeRepositoryImpl implements IApprovalTemplateNativeRepository {
    @PersistenceContext
    EntityManager entityManager;
    public Page<ApprovalTemplate> queryApprovalTemplates(String userId, String opinion, int curPage, int pageSize) throws Exception{
        StringBuilder sql = new StringBuilder("select * from wfm_approvaltemplate ");
        StringBuilder whereSql = new StringBuilder("where userId=? ");
        if(!ToolUtils.isEmpty(opinion)){
            whereSql.append(" and opinion like ?");
        }
        StringBuilder orderSql = new StringBuilder(" order by sort");

        Query query = entityManager.createNativeQuery(sql.append(whereSql).append(orderSql).toString(),ApprovalTemplate.class);
        query.setParameter(1,userId);
        if(!ToolUtils.isEmpty(opinion)){
            query.setParameter(2,opinion);
        }
        query.setFirstResult((curPage -1) * pageSize);
        query.setMaxResults(pageSize);
        List<ApprovalTemplate> list = query.getResultList();

        StringBuilder countSql = new StringBuilder("select count(*) from wfm_approvaltemplate ");
        Query countQuery = entityManager.createNativeQuery(countSql.append(whereSql).toString());
        countQuery.setParameter(1,userId);
        if(!ToolUtils.isEmpty(opinion)){
            countQuery.setParameter(2,opinion);
        }
        BigInteger count = (BigInteger) countQuery.getSingleResult();
        Pageable pageable = PageRequest.of(curPage -1 ,pageSize);
        Page<ApprovalTemplate> approvalTemplates = new PageImpl<ApprovalTemplate>(list, pageable,count.longValue());
        return approvalTemplates;
    }
}
