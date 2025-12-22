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
@RequestMapping("/api/hod")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HodController {

    private final DocumentService documentService;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/pending-documents")
    public ResponseEntity<List<DocumentDTO>> getPendingDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        User hod = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<DocumentDTO> documents = documentService.getDocumentsByHodAndStatus(hod, Document.DocumentStatus.FORWARDED_TO_HOD)
                .stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/all-documents")
    public ResponseEntity<List<DocumentDTO>> getAllDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        User hod = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<DocumentDTO> documents = documentService.getDocumentsByHod(hod)
                .stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @PostMapping("/approve")
    public ResponseEntity<DocumentDTO> approveDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User hod = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.hodApprove(request.getDocumentId(), hod);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/reject")
    public ResponseEntity<DocumentDTO> rejectDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User hod = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.hodReject(
                request.getDocumentId(),
                request.getRejectionReason(),
                hod
        );

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-dean")
    public ResponseEntity<DocumentDTO> forwardToDean(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User hod = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        User dean;
        if (request.getTargetUserId() != null) {
            dean = userService.findById(request.getTargetUserId())
                    .orElseThrow(() -> new RuntimeException("Selected Dean not found"));
            if (dean.getRole() != User.UserRole.DEAN) {
                throw new RuntimeException("Selected user is not a Dean");
            }
        } else {
            // Try to find Dean of the same department first
            dean = userService.getDeanByDepartment(hod.getDepartment())
                    .orElseGet(() -> userService.getAnyDean()
                            .orElseThrow(() -> new RuntimeException("No Dean found in the system. Please assign Dean role to a user first.")));
        }

        Document document = documentService.forwardToDean(request.getDocumentId(), dean, hod);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @GetMapping("/document/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User hod = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.getDocumentById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getHod() == null || !document.getHod().getId().equals(hod.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (document.getData() == null) {
             throw new RuntimeException("Document content not found");
        }

        org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(document.getData());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + document.getFileName() + "\"")
                .body(resource);
    }
}

