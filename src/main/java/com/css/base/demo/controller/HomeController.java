package com.css.base.demo.controller;

import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.text.DateFormat;
import java.util.Date;

/**
 * Created by lixiaofeng on 2020/3/24.
 */
@Controller
public class HomeController {
    @RequestMapping("/home")
    public String home(){
        return "core/platform/page/home/home";
    }
    @RequestMapping("/page")
    public String page(@RequestParam String ctrl,@RequestParam String html,Model model){

        model.addAttribute("ctrl",ctrl);
        model.addAttribute("html",ctrl);

        return "core/platform/page/subHome/subHome";
    }
}
