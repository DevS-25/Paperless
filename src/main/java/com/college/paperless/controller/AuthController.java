package com.college.paperless.controller;

import com.college.paperless.dto.LoginResponse;
import com.college.paperless.dto.UpdateProfileRequest;
import com.college.paperless.dto.UserDTO;
import com.college.paperless.entity.User;
import com.college.paperless.security.CustomUserDetailsService;
import com.college.paperless.security.JwtTokenUtil;
import com.college.paperless.service.FileStorageService;
import com.college.paperless.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;
    private final CustomUserDetailsService userDetailsService;
    private final FileStorageService fileStorageService;

    @PostMapping("/google-login")
    public ResponseEntity<LoginResponse> googleLogin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String googleId = request.get("googleId");
        String profilePicture = request.get("profilePicture");


        User user = userService.createOrUpdateUser(email, name, googleId, profilePicture);
        String token = jwtTokenUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        LoginResponse response = new LoginResponse(token, UserDTO.fromEntity(user));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        User updatedUser = userService.updateProfile(
                user,
                request.getName(),
                request.getVtuNumber(),
                request.getContactNumber(),
                request.getYearOfStudy(),
                request.getDepartment(),
                request.getTtsId()
        );
        return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
    }

    @PostMapping("/set-role")
    public ResponseEntity<?> setUserRole(
            @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String role = request.get("role");

            // Validate email
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate role
            if (role == null || role.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Role is required");
                return ResponseEntity.badRequest().body(error);
            }

            // Check if role is valid
            try {
                User.UserRole.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid role: " + role + ". Valid roles are: STUDENT, MENTOR, HOD, ADMIN, DEAN, DEAN_ACADEMICS, REGISTRAR, COE, EXAM_CELL, INDUSTRY_RELATIONS, RND");
                return ResponseEntity.badRequest().body(error);
            }

            // Find user
            User user = userService.findByEmail(email.toLowerCase().trim())
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email + ". The user must login at least once before a role can be assigned."));

            // Set role
            user.setRole(User.UserRole.valueOf(role.toUpperCase()));
            userService.updateProfile(user, user.getName(), user.getVtuNumber(),
                    user.getContactNumber(), user.getYearOfStudy(), user.getDepartment(), user.getTtsId());

            Map<String, String> response = new HashMap<>();
            response.put("message", "Role updated successfully to " + role);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/admin-login")
    public ResponseEntity<LoginResponse> adminLogin(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        // Normalize inputs to handle whitespace and case sensitivity for username
        if (username != null) username = username.trim();
        if (password != null) password = password.trim();

        // Hardcoded admin credentials for simplicity as requested
        if ("admin@veltech.edu.in".equalsIgnoreCase(username) && "Veltech@Admin2025".equals(password)) {
            // Create a dummy admin user object for token generation
            // In a real app, you'd fetch this from DB or have a dedicated admin table
            // Here we check if an admin user exists in DB to link to, otherwise we use a placeholder ID

            User adminUser = userService.findByEmail("admin@veltech.edu.in")
                    .orElseGet(() -> {
                        // Create admin user if not exists
                        return userService.createOrUpdateUser("admin@veltech.edu.in", "Administrator", "admin-google-id-placeholder", null);
                    });

            // Ensure role is ADMIN
            if (adminUser.getRole() != User.UserRole.ADMIN) {
                adminUser.setRole(User.UserRole.ADMIN);
                userService.updateProfile(adminUser, adminUser.getName(), adminUser.getVtuNumber(), adminUser.getContactNumber(), adminUser.getYearOfStudy(), adminUser.getDepartment(), adminUser.getTtsId());
            }

            String token = jwtTokenUtil.generateToken(adminUser.getEmail(), adminUser.getId(), "ADMIN");
            return ResponseEntity.ok(new LoginResponse(token, UserDTO.fromEntity(adminUser)));
        }

        return ResponseEntity.status(401).build();
    }
}
