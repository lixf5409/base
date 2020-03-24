package com.css.base.demo.controller;

import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import java.text.DateFormat;
import java.util.Date;

/**
 * Created by lixiaofeng on 2020/3/24.
 */
@Controller
public class HomeController {
    @RequestMapping("/home")
    public String home(){
        return "home/home";
    }
    @RequestMapping("/page")
    public String page(){
        return "subHome/subHome";
    }
}
