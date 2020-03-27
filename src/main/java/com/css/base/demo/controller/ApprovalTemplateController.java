package com.css.base.demo.controller;


import com.alibaba.fastjson.JSONObject;
import com.css.base.demo.common.utils.LoginUtils;
import com.css.base.demo.dao.entity.ApprovalTemplate;
import com.css.base.demo.service.IApprovalTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/wfm/ApprovalTemplateController/")
public class ApprovalTemplateController {

    @Autowired
    IApprovalTemplateService approvalTemplateService;
    @PostMapping("listApprovalTemplates")
    public Page<ApprovalTemplate> listApprovalTemplates(@RequestParam String opinion,
                                                        @RequestParam Integer curPage, @RequestParam Integer pageSize) throws Exception{
        String userId = LoginUtils.getLoginUserId();
        return  approvalTemplateService.listApprovalTemplates(userId,opinion,curPage,pageSize);
    }
    @PostMapping("listApprovalTemplatesForEasyUI")
    public JSONObject listApprovalTemplatesForEasyUI(@RequestParam String opinion,
                                                        @RequestParam Integer page, @RequestParam Integer rows) throws Exception{
        String userId = LoginUtils.getLoginUserId();
//        return  approvalTemplateService.listApprovalTemplates(userId,opinion,page,rows);
        return JSONObject.parseObject("{\"rows\":[{\"id\":\"04c91cd3ee4743528a6b620bce3f54c5\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"1\",\"sort\":1,\"createtime\":\"2020-03-26T08:23:38.000+0000\",\"updatetime\":\"2020-03-26T08:23:38.000+0000\",\"usedtime\":null,\"type\":\"\"},{\"id\":\"4f8038aa36774064aedb1fa824cd186e\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"同意\",\"sort\":1,\"createtime\":\"2015-11-02T05:49:13.000+0000\",\"updatetime\":\"2019-06-03T02:29:14.000+0000\",\"usedtime\":null,\"type\":\"user\"},{\"id\":\"b4b6992d279c4d2fae8334f6890be9e4\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"1\",\"sort\":1,\"createtime\":\"2020-03-26T08:45:37.000+0000\",\"updatetime\":\"2020-03-26T08:45:37.000+0000\",\"usedtime\":null,\"type\":\"\"},{\"id\":\"8ce9faca91fb436b8225503bdbda1e2a\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"不同意\",\"sort\":2,\"createtime\":\"2017-06-09T07:32:53.000+0000\",\"updatetime\":\"2019-06-03T02:29:20.000+0000\",\"usedtime\":null,\"type\":\"user\"},{\"id\":\"9ed78d5860e74fe9acc351bf286b39b7\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"2\",\"sort\":2,\"createtime\":\"2020-03-26T08:45:46.000+0000\",\"updatetime\":\"2020-03-26T08:45:46.000+0000\",\"usedtime\":null,\"type\":\"\"},{\"id\":\"c4625c02138f4e1ea317ebbe9b778a8e\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"dddd\",\"sort\":2,\"createtime\":\"2019-07-02T07:22:35.000+0000\",\"updatetime\":\"2019-07-02T07:31:41.000+0000\",\"usedtime\":null,\"type\":\"user\"},{\"id\":\"33d04eb80d0046aab560990d5957327f\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"3\",\"sort\":3,\"createtime\":\"2020-03-26T08:25:02.000+0000\",\"updatetime\":\"2020-03-26T08:25:02.000+0000\",\"usedtime\":null,\"type\":\"\"},{\"id\":\"2e2643c8119c4a2192f1be68fde0d7dc\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"4\",\"sort\":4,\"createtime\":\"2020-03-26T08:25:17.000+0000\",\"updatetime\":\"2020-03-26T08:25:17.000+0000\",\"usedtime\":null,\"type\":\"\"},{\"id\":\"3d95622e09d146b9b2cdc3cb3ad29bb0\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"5\",\"sort\":5,\"createtime\":\"2020-03-26T08:25:29.000+0000\",\"updatetime\":\"2020-03-26T08:25:29.000+0000\",\"usedtime\":null,\"type\":\"\"},{\"id\":\"852c1749a5834a739f66d6fd8df22fa2\",\"userId\":\"c8f1ba6c7cf842409aba43206e9f7442\",\"opinion\":\"6\",\"sort\":6,\"createtime\":\"2020-03-26T08:25:32.000+0000\",\"updatetime\":\"2020-03-26T08:25:32.000+0000\",\"usedtime\":null,\"type\":\"\"}],\"pageable\":{\"sort\":{\"sorted\":false,\"unsorted\":true,\"empty\":true},\"offset\":0,\"pageNumber\":0,\"pageSize\":10,\"paged\":true,\"unpaged\":false},\"total\":12,\"totalPages\":2,\"last\":false,\"number\":0,\"size\":10,\"sort\":{\"sorted\":false,\"unsorted\":true,\"empty\":true},\"numberOfElements\":10,\"first\":true,\"empty\":false}");

    }
    @GetMapping("getApprovalTemplate")
    public ApprovalTemplate getApprovalTemplate(@RequestParam String id) throws Exception {
        return approvalTemplateService.getApprovalTemplate(id);
    }
    @PostMapping("saveApprovalTemplate")
    public JSONObject saveApprovalTemplate(ApprovalTemplate approvalTemplate) throws Exception {
        JSONObject json = new JSONObject();
        String userId = LoginUtils.getLoginUserId();
        approvalTemplate.setUserId(userId);
        approvalTemplateService.saveApprovalTemplate(approvalTemplate);
        json.put("message", "保存成功!");
        return json;
    }
    @PostMapping("deleteApprovalTemplates")
    public JSONObject deleteApprovalTemplates(@RequestParam String ids) throws Exception {
        JSONObject json = new JSONObject();
        List<String> idList = Arrays.asList(ids.split(","));
        approvalTemplateService.deleteApprovalTemplates(idList);
        //前台未做提示信息显示，故不用做多语言
        json.put("message", "删除成功!");
        return json;
    }
}