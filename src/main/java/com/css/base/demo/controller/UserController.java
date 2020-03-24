package com.css.base.demo.controller;


import com.css.base.demo.dao.entity.User;
import com.css.base.demo.service.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    IUserService userService;

    @GetMapping("/listUser")
    public  List<User> listUser() {
        List<User> users = userService.findAll();
        return users;
    }
    @GetMapping("/getUser")
    public User getUser(Integer userId) {
        User user = userService.getUser(userId);
        return user;
    }
}