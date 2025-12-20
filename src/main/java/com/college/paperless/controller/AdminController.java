package com.college.paperless.controller;

import com.college.paperless.entity.Document;
import com.college.paperless.entity.User;
import com.college.paperless.repository.DocumentRepository;
import com.college.paperless.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AdminController {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Count total users
            long totalUsers = userRepository.count();
            stats.put("totalUsers", totalUsers);

            // Count students
            long students = userRepository.countByRolesContaining(User.UserRole.STUDENT);
            stats.put("students", students);

            // Count mentors
            long mentors = userRepository.countByRolesContaining(User.UserRole.MENTOR);
            stats.put("mentors", mentors);

            // Count HODs
            long hods = userRepository.countByRolesContaining(User.UserRole.HOD);
            stats.put("hods", hods);

            // Count total documents
            long totalDocuments = documentRepository.count();
            stats.put("totalDocuments", totalDocuments);

            // Count pending approvals (documents forwarded to mentor or HOD)
            long pendingApprovals = documentRepository.countByStatusIn(
                Arrays.asList(Document.DocumentStatus.FORWARDED_TO_MENTOR, Document.DocumentStatus.FORWARDED_TO_HOD)
            );
            stats.put("pendingApprovals", pendingApprovals);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            // Return zeros if there's an error
            stats.put("totalUsers", 0);
            stats.put("students", 0);
            stats.put("mentors", 0);
            stats.put("hods", 0);
            stats.put("totalDocuments", 0);
            stats.put("pendingApprovals", 0);
            return ResponseEntity.ok(stats);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }
}

