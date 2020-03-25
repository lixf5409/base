package com.css.base.demo.controller;


import com.alibaba.fastjson.JSONObject;
import com.css.base.demo.common.utils.LoginUtils;
import com.css.base.demo.service.IApprovalTemplateService;
import com.css.base.demo.dao.entity.WfmApprovalTemplate;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/wfm/ApprovalTemplateController/")
public class ApprovalTemplateController {

    @Autowired
    IApprovalTemplateService approvalTemplateService;
    @PostMapping("listApprovalTemplates")
    public PageInfo<WfmApprovalTemplate> listApprovalTemplates(@RequestParam String opinion,
                                                               @RequestParam Integer curPage,@RequestParam Integer pageSize) throws Exception{
        String userId = LoginUtils.getLoginUserId();
        return  approvalTemplateService.listApprovalTemplates(userId,curPage,pageSize,opinion);
    }


    @GetMapping("getApprovalTemplate")
    public WfmApprovalTemplate getApprovalTemplate(@RequestParam String id) throws Exception {
        return approvalTemplateService.getApprovalTemplate(id);
    }
    @PostMapping("saveApprovalTemplate")
    public JSONObject saveApprovalTemplate(WfmApprovalTemplate approvalTemplate) throws Exception {
        JSONObject json = new JSONObject();
        approvalTemplateService.saveApprovalTemplate(approvalTemplate);
        json.put("message", "保存成功!");
        return json;
    }
    @DeleteMapping("deleteApprovalTemplates")
    public JSONObject deleteApprovalTemplates(@RequestParam String ids) throws Exception {
        JSONObject json = new JSONObject();
        List<String> idList = Arrays.asList(ids.split(","));
        approvalTemplateService.deleteApprovalTemplates(idList);
        //前台未做提示信息显示，故不用做多语言
        json.put("message", "删除成功!");
        return json;
    }
}