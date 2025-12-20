package com.college.paperless.controller;

import com.college.paperless.dto.DocumentActionRequest;
import com.college.paperless.dto.DocumentDTO;
import com.college.paperless.entity.Document;
import com.college.paperless.entity.User;
import com.college.paperless.security.CustomUserDetailsService;
import com.college.paperless.service.DocumentService;
import com.college.paperless.service.FileStorageService;
import com.college.paperless.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
public class MentorController {

    private final DocumentService documentService;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/pending-documents")
    public ResponseEntity<List<DocumentDTO>> getPendingDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        User mentor = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<DocumentDTO> documents = documentService.getMentorPendingDocuments(mentor)
                .stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/all-documents")
    public ResponseEntity<List<DocumentDTO>> getAllDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        User mentor = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<DocumentDTO> documents = documentService.getMentorAllDocuments(mentor)
                .stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @PostMapping("/approve")
    public ResponseEntity<DocumentDTO> approveDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User mentor = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.mentorApprove(request.getDocumentId(), mentor);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/reject")
    public ResponseEntity<DocumentDTO> rejectDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User mentor = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.mentorReject(
                request.getDocumentId(),
                request.getRejectionReason(),
                mentor
        );

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-hod")
    public ResponseEntity<DocumentDTO> forwardToHod(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User mentor = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        // Get HOD from request (mentorId field is reused for hodId)
        User hod = userService.findById(request.getMentorId())
                .orElseThrow(() -> new RuntimeException("Selected HOD not found"));

        // Verify the user is actually an HOD
        if (hod.getRole() != User.UserRole.HOD) {
            throw new RuntimeException("Selected user is not an HOD");
        }

        Document document = documentService.forwardToHod(request.getDocumentId(), hod, mentor);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @GetMapping("/document/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User mentor = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.getDocumentById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getMentor() == null || !document.getMentor().getId().equals(mentor.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        Path filePath = fileStorageService.getFilePath(document.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + document.getFileName() + "\"")
                .body(resource);
    }
}

