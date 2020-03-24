package com.css.base.demo.service;


import com.css.base.demo.dao.entity.User;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Created by lixiaofeng on 2019/11/12.
 */
public interface IUserService {
    List<User> findAll();
    User getUser(@Param("userId") Integer userId);
}
