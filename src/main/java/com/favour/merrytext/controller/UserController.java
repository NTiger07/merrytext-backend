package com.favour.merrytext.controller;

import com.favour.merrytext.model.User;
import com.favour.merrytext.repository.UserRepository;
import com.favour.merrytext.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@RestController
@RequestMapping("merrytext/api/v1/users")
public class UserController {
    private final UserService userservice;

    public UserController(UserService userService){
        this.userservice = userService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return userservice.getAllUsers();
    }
}
