package com.college.paperless.controller;

import com.college.paperless.dto.UserDTO;
import com.college.paperless.entity.User;
import com.college.paperless.security.CustomUserDetailsService;
import com.college.paperless.service.FileStorageService;
import com.college.paperless.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CustomUserDetailsService userDetailsService;
    private final FileStorageService fileStorageService;

    @PostMapping("/signature")
    public ResponseEntity<?> uploadSignature(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "role", required = false) String role) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

            User updatedUser = userService.updateSignature(user, file.getBytes(), role);
            return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload signature: " + e.getMessage());
        }
    }
}
