package com.college.paperless.controller;

import com.college.paperless.dto.DocumentDTO;
import com.college.paperless.dto.UserDTO;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {

    private final DocumentService documentService;
    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentDTO> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User student = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.uploadDocument(file, description, student);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentDTO>> getMyDocuments(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        List<DocumentDTO> documents = documentService.getStudentDocuments(student)
                .stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documents);
    }

    @PostMapping("/forward/{documentId}")
    public ResponseEntity<DocumentDTO> forwardToMentor(
            @PathVariable Long documentId,
            @RequestParam Long mentorId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User mentor = userService.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));
        User student = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        Document document = documentService.forwardToMentor(documentId, student, mentor);

        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @GetMapping("/mentors")
    public ResponseEntity<List<UserDTO>> getAllMentors(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());

        List<UserDTO> mentors = userService.getMentorsByDepartment(student.getDepartment())
                .stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/document/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User student = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        Document document = documentService.getDocumentById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getStudent().getId().equals(student.getId())) {
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

    @DeleteMapping("/document/{documentId}")
    public ResponseEntity<Map<String, String>> deleteDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        User student = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        documentService.deleteDraftDocument(documentId, student);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Document deleted successfully");
        return ResponseEntity.ok(response);
    }
}
