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
@RequestMapping("/api/exam-cell")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExamCellController {

    private final DocumentService documentService;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/pending-documents")
    public ResponseEntity<List<DocumentDTO>> getPendingDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        User examCell = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<DocumentDTO> documents = documentService.getDocumentsByExamCellAndStatus(examCell, Document.DocumentStatus.FORWARDED_TO_EXAM_CELL)
                .stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/all-documents")
    public ResponseEntity<List<DocumentDTO>> getAllDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        User examCell = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<DocumentDTO> documents = documentService.getDocumentsByExamCell(examCell)
                .stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @PostMapping("/approve")
    public ResponseEntity<DocumentDTO> approveDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User examCell = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.examCellApprove(request.getDocumentId(), examCell);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/reject")
    public ResponseEntity<DocumentDTO> rejectDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User examCell = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.examCellReject(
                request.getDocumentId(),
                request.getRejectionReason(),
                examCell
        );

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @GetMapping("/document/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User examCell = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.getDocumentById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getExamCell() == null || !document.getExamCell().getId().equals(examCell.getId())) {
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

