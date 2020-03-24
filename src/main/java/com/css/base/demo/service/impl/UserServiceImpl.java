package com.css.base.demo.service.impl;

import com.example.springcloud.user.dao.entity.User;
import com.example.springcloud.user.dao.mapper.UserMapper;
import com.example.springcloud.user.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by lixiaofeng on 2019/11/12.
 */
@Service("userService")
public class UserServiceImpl implements IUserService {
    @Autowired
    UserMapper userMapper;
    @Override
    public List<User> findAll() {
        return userMapper.findAll();
    }

    @Override
    public User getUser(Integer userId) {
        return userMapper.getUser(userId);
    }
}
