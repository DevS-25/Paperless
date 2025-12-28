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
@RequestMapping("/api/industry-relations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IndustryRelationsController {

    private final DocumentService documentService;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/pending-documents")
    public ResponseEntity<Page<DocumentDTO>> getPendingDocuments(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        User industryRelations = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Page<DocumentDTO> documents = documentService.getDocumentsByIndustryRelationsAndStatus(industryRelations, Document.DocumentStatus.FORWARDED_TO_INDUSTRY_RELATIONS, PageRequest.of(page, size))
                .map(DocumentDTO::fromEntity);

        return ResponseEntity.ok(documents);
    }

    @GetMapping("/all-documents")
    public ResponseEntity<Page<DocumentDTO>> getAllDocuments(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        User industryRelations = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Page<DocumentDTO> documents = documentService.getDocumentsByIndustryRelations(industryRelations, PageRequest.of(page, size))
                .map(DocumentDTO::fromEntity);

        return ResponseEntity.ok(documents);
    }

    @PostMapping("/approve")
    public ResponseEntity<DocumentDTO> approveDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User industryRelations = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.industryRelationsApprove(request.getDocumentId(), industryRelations);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/reject")
    public ResponseEntity<DocumentDTO> rejectDocument(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User industryRelations = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.industryRelationsReject(
                request.getDocumentId(),
                request.getRejectionReason(),
                industryRelations
        );

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-dean")
    public ResponseEntity<DocumentDTO> forwardToDean(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User industryRelations = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        User dean = userService.getAnyDean()
                .orElseThrow(() -> new RuntimeException("No Dean found in the system."));

        Document document = documentService.forwardFromIndustryRelationsToDean(request.getDocumentId(), dean, industryRelations);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-dean-academics")
    public ResponseEntity<DocumentDTO> forwardToDeanAcademics(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User industryRelations = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        User deanAcademics = userService.getAnyDeanAcademics()
                .orElseThrow(() -> new RuntimeException("No Dean Academics found in the system."));

        Document document = documentService.forwardFromIndustryRelationsToDeanAcademics(request.getDocumentId(), deanAcademics, industryRelations);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-rnd")
    public ResponseEntity<DocumentDTO> forwardToRnd(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User industryRelations = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        User rnd = userService.getAnyRnd()
                .orElseThrow(() -> new RuntimeException("No R&D user found in the system."));

        Document document = documentService.forwardFromIndustryRelationsToRnd(request.getDocumentId(), rnd, industryRelations);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PostMapping("/forward-to-hod")
    public ResponseEntity<DocumentDTO> forwardToHod(
            @RequestBody DocumentActionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        User industryRelations = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        // For HOD, we should ideally find the HOD related to the document/student.
        // But for now, we'll use getAnyHod() or if the document already has an HOD assigned, we might want to use that.
        // However, the request might not carry HOD info.
        // Let's try to find the HOD from the document if possible, or just get any HOD (which is what getAnyHod does).
        // Since the requirement is just "forward to HoD", and usually there's one HOD per department,
        // and if the system is simple enough to have one HOD role user, getAnyHod works.
        // If there are multiple HODs, we might need logic to pick the right one.
        // Assuming single HOD for now as per other controllers.

        User hod = userService.getAnyHod()
                .orElseThrow(() -> new RuntimeException("No HOD found in the system."));

        Document document = documentService.forwardFromIndustryRelationsToHod(request.getDocumentId(), hod, industryRelations);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @GetMapping("/document/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User industryRelations = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.getDocumentById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getIndustryRelations() == null || !document.getIndustryRelations().getId().equals(industryRelations.getId())) {
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
