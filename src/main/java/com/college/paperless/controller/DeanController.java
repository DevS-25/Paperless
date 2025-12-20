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
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dean")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeanController {

    private final DocumentService documentService;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/pending-documents")
    public ResponseEntity<List<DocumentDTO>> getPendingDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        User dean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<DocumentDTO> documents = documentService.getDocumentsByDeanAndStatus(dean, Document.DocumentStatus.FORWARDED_TO_DEAN)
                .stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/all-documents")
    public ResponseEntity<List<DocumentDTO>> getAllDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        User dean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<DocumentDTO> documents = documentService.getDocumentsByDean(dean)
                .stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @PostMapping("/approve")
    public ResponseEntity<DocumentDTO> approveDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User dean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.deanApprove(request.getDocumentId(), dean);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/reject")
    public ResponseEntity<DocumentDTO> rejectDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User dean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.deanReject(
                request.getDocumentId(),
                request.getRejectionReason(),
                dean
        );

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-dean-academics")
    public ResponseEntity<DocumentDTO> forwardToDeanAcademics(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User dean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        // Automatically find any available Dean Academics
        User deanAcademics = userService.getAnyDeanAcademics()
                .orElseThrow(() -> new RuntimeException("No Dean Academics found in the system. Please assign Dean Academics role to a user first."));

        Document document = documentService.forwardToDeanAcademics(request.getDocumentId(), deanAcademics, dean);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-industry-relations")
    public ResponseEntity<DocumentDTO> forwardToIndustryRelations(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User dean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        User industryRelations = userService.getAnyIndustryRelations()
                .orElseThrow(() -> new RuntimeException("No Industry Relations user found in the system. Please assign the INDUSTRY_RELATIONS role to a user."));

        Document document = documentService.forwardToIndustryRelations(request.getDocumentId(), industryRelations, dean);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-rnd")
    public ResponseEntity<DocumentDTO> forwardToRnd(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User dean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        User rnd = userService.getAnyRnd()
                .orElseThrow(() -> new RuntimeException("No R&D user found in the system."));

        Document document = documentService.forwardToRnd(request.getDocumentId(), rnd, dean);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-coe")
    public ResponseEntity<DocumentDTO> forwardToCoe(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User dean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        User coe = userService.getAnyCoe()
                .orElseThrow(() -> new RuntimeException("No CoE user found in the system."));

        Document document = documentService.forwardToCoe(request.getDocumentId(), coe, dean);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-dean")
    public ResponseEntity<DocumentDTO> forwardToDean(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User currentDean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        User targetDean = userService.findById(request.getTargetUserId())
                .orElseThrow(() -> new RuntimeException("Selected Dean not found"));

        if (targetDean.getRole() != User.UserRole.DEAN) {
             throw new RuntimeException("Selected user is not a Dean");
        }

        Document document = documentService.forwardToDeanFromDean(request.getDocumentId(), targetDean, currentDean);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @GetMapping("/document/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User dean = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.getDocumentById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDean() == null || !document.getDean().getId().equals(dean.getId())) {
            throw new RuntimeException("Access denied");
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
