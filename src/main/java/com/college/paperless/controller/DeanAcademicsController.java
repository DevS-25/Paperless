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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
@RequestMapping("/api/dean-academics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeanAcademicsController {

    private final DocumentService documentService;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/pending-documents")
    public ResponseEntity<Page<DocumentDTO>> getPendingDocuments(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        User deanAcademics = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Pageable pageable = PageRequest.of(page, size);
        Page<DocumentDTO> documents = documentService.getDocumentsByDeanAcademicsAndStatus(deanAcademics, Document.DocumentStatus.FORWARDED_TO_DEAN_ACADEMICS, pageable)
                .map(DocumentDTO::fromEntity);

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/all-documents")
    public ResponseEntity<Page<DocumentDTO>> getAllDocuments(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        User deanAcademics = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Pageable pageable = PageRequest.of(page, size);
        Page<DocumentDTO> documents = documentService.getDocumentsByDeanAcademics(deanAcademics, pageable)
                .map(DocumentDTO::fromEntity);

        return ResponseEntity.ok(documents);
    }

    @PostMapping("/approve")
    public ResponseEntity<DocumentDTO> approveDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User deanAcademics = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.deanAcademicsApprove(request.getDocumentId(), deanAcademics);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/reject")
    public ResponseEntity<DocumentDTO> rejectDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User deanAcademics = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.deanAcademicsReject(
                request.getDocumentId(),
                request.getRejectionReason(),
                deanAcademics
        );

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-registrar")
    public ResponseEntity<DocumentDTO> forwardToRegistrar(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User deanAcademics = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        // Automatically find any available Registrar
        User registrar = userService.getAnyRegistrar()
                .orElseThrow(() -> new RuntimeException("No Registrar found in the system. Please assign Registrar role to a user first."));

        Document document = documentService.forwardToRegistrar(request.getDocumentId(), registrar, deanAcademics);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-exam-cell")
    public ResponseEntity<DocumentDTO> forwardToExamCell(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User deanAcademics = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        User examCell = userService.getAnyExamCell()
                .orElseThrow(() -> new RuntimeException("No Exam Cell user found in the system."));

        Document document = documentService.forwardToExamCell(request.getDocumentId(), examCell, deanAcademics);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @GetMapping("/document/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User deanAcademics = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.getDocumentById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDeanAcademics() == null || !document.getDeanAcademics().getId().equals(deanAcademics.getId())) {
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

