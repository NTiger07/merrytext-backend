package com.favour.merrytext.controller;

import com.favour.merrytext.model.User;
import com.favour.merrytext.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("merrytext/api/v1/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("{username}")
    public User getUserByUSername(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }
    
}
