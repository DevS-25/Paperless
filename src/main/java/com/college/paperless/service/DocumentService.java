package com.college.paperless.service;

import com.college.paperless.entity.Document;
import com.college.paperless.entity.User;
import com.college.paperless.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final PdfService pdfService;

    @Transactional
    public Document uploadDocument(MultipartFile file, String description, User student) throws IOException {
        // Store file in DB
        Document document = new Document();
        document.setFileName(file.getOriginalFilename());
        document.setFilePath("DB_STORED"); // Placeholder or keep original filename
        document.setFileType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setDescription(description);
        document.setStudent(student);
        document.setStatus(Document.DocumentStatus.DRAFT);
        document.setData(file.getBytes());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardToMentor(Long documentId, User student, User mentor) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized: You can only forward your own documents");
        }

        document.setMentor(mentor);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_MENTOR);
        document.setForwardedToMentorAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document mentorApprove(Long documentId, User mentor) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getMentor().getId().equals(mentor.getId())) {
            throw new RuntimeException("You are not authorized to approve this document");
        }

        // Add digital signature
        pdfService.addDigitalSignToPdf(document, mentor, "MENTOR");

        document.setStatus(Document.DocumentStatus.APPROVED_BY_MENTOR);
        document.setMentorActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document mentorReject(Long documentId, String reason, User mentor) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getMentor().getId().equals(mentor.getId())) {
            throw new RuntimeException("You are not authorized to reject this document");
        }

        document.setStatus(Document.DocumentStatus.REJECTED_BY_MENTOR);
        document.setRejectionReason(reason);
        document.setMentorActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardToHod(Long documentId, User hod, User mentor) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getMentor().getId().equals(mentor.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setHod(hod);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_HOD);
        document.setForwardedToHodAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getStudentDocuments(User student) {
        return documentRepository.findByStudentOrderByUploadedAtDesc(student);
    }

    public List<Document> getMentorPendingDocuments(User mentor) {
        return documentRepository.findByMentorAndStatusOrderByForwardedToMentorAtDesc(
                mentor, Document.DocumentStatus.FORWARDED_TO_MENTOR);
    }

    public List<Document> getMentorAllDocuments(User mentor) {
        return documentRepository.findByMentorOrderByForwardedToMentorAtDesc(mentor);
    }

    public Optional<Document> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    public List<Document> getHodPendingDocuments(User hod) {
        return documentRepository.findByHodAndStatusOrderByForwardedToHodAtDesc(
                hod, Document.DocumentStatus.FORWARDED_TO_HOD);
    }

    public List<Document> getDocumentsByHodAndStatus(User hod, Document.DocumentStatus status) {
        return documentRepository.findByHodAndStatusOrderByForwardedToHodAtDesc(hod, status);
    }

    public List<Document> getDocumentsByHod(User hod) {
        return documentRepository.findByHodOrderByForwardedToHodAtDesc(hod);
    }

    @Transactional
    public Document hodApprove(Long documentId, User hod) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getHod() == null || !document.getHod().getId().equals(hod.getId())) {
            throw new RuntimeException("You are not authorized to approve this document");
        }

        // Add digital signature
        pdfService.addDigitalSignToPdf(document, hod, "HOD");

        document.setStatus(Document.DocumentStatus.APPROVED_BY_HOD);
        document.setHodActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document hodReject(Long documentId, String reason, User hod) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getHod() == null || !document.getHod().getId().equals(hod.getId())) {
            throw new RuntimeException("You are not authorized to reject this document");
        }

        document.setStatus(Document.DocumentStatus.REJECTED_BY_HOD);
        document.setRejectionReason(reason);
        document.setHodActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardToDean(Long documentId, User dean, User hod) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getHod().getId().equals(hod.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setDean(dean);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_DEAN);
        document.setForwardedToDeanAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByDeanAndStatus(User dean, Document.DocumentStatus status) {
        return documentRepository.findByDeanAndStatusOrderByForwardedToDeanAtDesc(dean, status);
    }

    public List<Document> getDocumentsByDean(User dean) {
        return documentRepository.findByDeanOrderByForwardedToDeanAtDesc(dean);
    }

    @Transactional
    public Document deanApprove(Long documentId, User dean) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDean() == null || !document.getDean().getId().equals(dean.getId())) {
            throw new RuntimeException("You are not authorized to approve this document");
        }

        // Add digital signature
        pdfService.addDigitalSignToPdf(document, dean, "DEAN");

        document.setStatus(Document.DocumentStatus.APPROVED_BY_DEAN);
        document.setDeanActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document deanReject(Long documentId, String reason, User dean) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDean() == null || !document.getDean().getId().equals(dean.getId())) {
            throw new RuntimeException("You are not authorized to reject this document");
        }

        document.setStatus(Document.DocumentStatus.REJECTED_BY_DEAN);
        document.setRejectionReason(reason);
        document.setDeanActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardToDeanAcademics(Long documentId, User deanAcademics, User dean) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDean() == null || !document.getDean().getId().equals(dean.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setDeanAcademics(deanAcademics);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_DEAN_ACADEMICS);
        document.setForwardedToDeanAcademicsAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByDeanAcademicsAndStatus(User deanAcademics, Document.DocumentStatus status) {
        return documentRepository.findByDeanAcademicsAndStatusOrderByForwardedToDeanAcademicsAtDesc(deanAcademics, status);
    }

    public List<Document> getDocumentsByDeanAcademics(User deanAcademics) {
        return documentRepository.findByDeanAcademicsOrderByForwardedToDeanAcademicsAtDesc(deanAcademics);
    }

    @Transactional
    public Document deanAcademicsApprove(Long documentId, User deanAcademics) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDeanAcademics() == null || !document.getDeanAcademics().getId().equals(deanAcademics.getId())) {
            throw new RuntimeException("You are not authorized to approve this document");
        }

        // Add digital signature
        pdfService.addDigitalSignToPdf(document, deanAcademics, "DEAN ACADEMICS");

        document.setStatus(Document.DocumentStatus.APPROVED_BY_DEAN_ACADEMICS);
        document.setDeanAcademicsActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document deanAcademicsReject(Long documentId, String reason, User deanAcademics) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDeanAcademics() == null || !document.getDeanAcademics().getId().equals(deanAcademics.getId())) {
            throw new RuntimeException("You are not authorized to reject this document");
        }

        document.setStatus(Document.DocumentStatus.REJECTED_BY_DEAN_ACADEMICS);
        document.setRejectionReason(reason);
        document.setDeanAcademicsActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardToRegistrar(Long documentId, User registrar, User deanAcademics) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDeanAcademics() == null || !document.getDeanAcademics().getId().equals(deanAcademics.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setRegistrar(registrar);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_REGISTRAR);
        document.setForwardedToRegistrarAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByRegistrarAndStatus(User registrar, Document.DocumentStatus status) {
        return documentRepository.findByRegistrarAndStatusOrderByForwardedToRegistrarAtDesc(registrar, status);
    }

    public List<Document> getDocumentsByRegistrar(User registrar) {
        return documentRepository.findByRegistrarOrderByForwardedToRegistrarAtDesc(registrar);
    }

    @Transactional
    public Document registrarApprove(Long documentId, User registrar) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getRegistrar() == null || !document.getRegistrar().getId().equals(registrar.getId())) {
            throw new RuntimeException("You are not authorized to approve this document");
        }

        // Add digital signature
        pdfService.addDigitalSignToPdf(document, registrar, "REGISTRAR");

        document.setStatus(Document.DocumentStatus.APPROVED_BY_REGISTRAR);
        document.setRegistrarActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document registrarReject(Long documentId, String reason, User registrar) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getRegistrar() == null || !document.getRegistrar().getId().equals(registrar.getId())) {
            throw new RuntimeException("You are not authorized to reject this document");
        }

        document.setStatus(Document.DocumentStatus.REJECTED_BY_REGISTRAR);
        document.setRejectionReason(reason);
        document.setRegistrarActionAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardToCoe(Long documentId, User coe, User dean) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDean() == null || !document.getDean().getId().equals(dean.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setCoe(coe);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_COE);
        document.setForwardedToCoeAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByCoeAndStatus(User coe, Document.DocumentStatus status) {
        return documentRepository.findByCoeAndStatusOrderByForwardedToCoeAtDesc(coe, status);
    }

    public List<Document> getDocumentsByCoe(User coe) {
        return documentRepository.findByCoeOrderByForwardedToCoeAtDesc(coe);
    }

    @Transactional
    public Document coeApprove(Long documentId, User coe) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getCoe() == null || !document.getCoe().getId().equals(coe.getId())) {
            throw new RuntimeException("You are not authorized to approve this document");
        }

        // Add digital signature
        pdfService.addDigitalSignToPdf(document, coe, "COE");

        document.setStatus(Document.DocumentStatus.APPROVED_BY_COE);
        // document.setCoeActionAt(LocalDateTime.now()); // Add timestamp if needed
        return documentRepository.save(document);
    }

    @Transactional
    public Document coeReject(Long documentId, String reason, User coe) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getCoe() == null || !document.getCoe().getId().equals(coe.getId())) {
            throw new RuntimeException("You are not authorized to reject this document");
        }

        document.setStatus(Document.DocumentStatus.REJECTED_BY_COE);
        document.setRejectionReason(reason);
        // document.setCoeActionAt(LocalDateTime.now());
        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardToRnd(Long documentId, User rnd, User dean) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDean() == null || !document.getDean().getId().equals(dean.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setRnd(rnd);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_RND);
        document.setForwardedToRndAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByRndAndStatus(User rnd, Document.DocumentStatus status) {
        return documentRepository.findByRndAndStatusOrderByForwardedToRndAtDesc(rnd, status);
    }

    public List<Document> getDocumentsByRnd(User rnd) {
        return documentRepository.findByRndOrderByForwardedToRndAtDesc(rnd);
    }

    @Transactional
    public Document rndApprove(Long documentId, User rnd) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getRnd() == null || !document.getRnd().getId().equals(rnd.getId())) {
            throw new RuntimeException("You are not authorized to approve this document");
        }

        // Add digital signature
        pdfService.addDigitalSignToPdf(document, rnd, "R&D");

        document.setStatus(Document.DocumentStatus.APPROVED_BY_RND);
        return documentRepository.save(document);
    }

    @Transactional
    public Document rndReject(Long documentId, String reason, User rnd) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getRnd() == null || !document.getRnd().getId().equals(rnd.getId())) {
            throw new RuntimeException("You are not authorized to reject this document");
        }

        document.setStatus(Document.DocumentStatus.REJECTED_BY_RND);
        document.setRejectionReason(reason);
        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardToIndustryRelations(Long documentId, User industryRelations, User dean) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDean() == null || !document.getDean().getId().equals(dean.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setIndustryRelations(industryRelations);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_INDUSTRY_RELATIONS);
        document.setForwardedToIndustryRelationsAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByIndustryRelationsAndStatus(User industryRelations, Document.DocumentStatus status) {
        return documentRepository.findByIndustryRelationsAndStatusOrderByForwardedToIndustryRelationsAtDesc(industryRelations, status);
    }

    public List<Document> getDocumentsByIndustryRelations(User industryRelations) {
        return documentRepository.findByIndustryRelationsOrderByForwardedToIndustryRelationsAtDesc(industryRelations);
    }

    @Transactional
    public Document industryRelationsApprove(Long documentId, User industryRelations) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getIndustryRelations() == null || !document.getIndustryRelations().getId().equals(industryRelations.getId())) {
            throw new RuntimeException("You are not authorized to approve this document");
        }

        // Add digital signature
        pdfService.addDigitalSignToPdf(document, industryRelations, "INDUSTRY RELATIONS");

        document.setStatus(Document.DocumentStatus.APPROVED_BY_INDUSTRY_RELATIONS);
        return documentRepository.save(document);
    }

    @Transactional
    public Document industryRelationsReject(Long documentId, String reason, User industryRelations) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getIndustryRelations() == null || !document.getIndustryRelations().getId().equals(industryRelations.getId())) {
            throw new RuntimeException("You are not authorized to reject this document");
        }

        document.setStatus(Document.DocumentStatus.REJECTED_BY_INDUSTRY_RELATIONS);
        document.setRejectionReason(reason);
        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardFromIndustryRelationsToDean(Long documentId, User dean, User industryRelations) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getIndustryRelations() == null || !document.getIndustryRelations().getId().equals(industryRelations.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setDean(dean);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_DEAN);
        document.setForwardedToDeanAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardFromIndustryRelationsToDeanAcademics(Long documentId, User deanAcademics, User industryRelations) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getIndustryRelations() == null || !document.getIndustryRelations().getId().equals(industryRelations.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setDeanAcademics(deanAcademics);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_DEAN_ACADEMICS);
        document.setForwardedToDeanAcademicsAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardFromIndustryRelationsToRnd(Long documentId, User rnd, User industryRelations) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getIndustryRelations() == null || !document.getIndustryRelations().getId().equals(industryRelations.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setRnd(rnd);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_RND);
        document.setForwardedToRndAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardFromIndustryRelationsToHod(Long documentId, User hod, User industryRelations) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getIndustryRelations() == null || !document.getIndustryRelations().getId().equals(industryRelations.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        // If HOD is already assigned (e.g. from student -> mentor -> hod), use that HOD?
        // Or should we assign a new HOD?
        // Usually HOD is determined by the student's department.
        // If the document came from HOD, we might want to send it back?
        // For now, let's assume we are forwarding to the HOD passed in (which should be found via UserService).
        // But wait, HOD is usually specific to the student.
        // If the document has an HOD already, we should probably use that one, or update it.

        document.setHod(hod);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_HOD);
        document.setForwardedToHodAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    @Transactional
    public Document forwardToExamCell(Long documentId, User examCell, User deanAcademics) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // Check if the user is either CoE or Dean Academics
        boolean isCoe = document.getCoe() != null && document.getCoe().getId().equals(deanAcademics.getId());
        boolean isDeanAcademics = document.getDeanAcademics() != null && document.getDeanAcademics().getId().equals(deanAcademics.getId());

        if (!isCoe && !isDeanAcademics) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setExamCell(examCell);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_EXAM_CELL);
        document.setForwardedToExamCellAt(LocalDateTime.now());

        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByExamCellAndStatus(User examCell, Document.DocumentStatus status) {
        return documentRepository.findByExamCellAndStatusOrderByForwardedToExamCellAtDesc(examCell, status);
    }

    public List<Document> getDocumentsByExamCell(User examCell) {
        return documentRepository.findByExamCellOrderByForwardedToExamCellAtDesc(examCell);
    }

    @Transactional
    public Document examCellApprove(Long documentId, User examCell) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getExamCell() == null || !document.getExamCell().getId().equals(examCell.getId())) {
            throw new RuntimeException("You are not authorized to approve this document");
        }

        // Add digital signature
        pdfService.addDigitalSignToPdf(document, examCell, "EXAM CELL");

        document.setStatus(Document.DocumentStatus.APPROVED_BY_EXAM_CELL);
        return documentRepository.save(document);
    }

    @Transactional
    public Document examCellReject(Long documentId, String reason, User examCell) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getExamCell() == null || !document.getExamCell().getId().equals(examCell.getId())) {
            throw new RuntimeException("You are not authorized to reject this document");
        }

        document.setStatus(Document.DocumentStatus.REJECTED_BY_EXAM_CELL);
        document.setRejectionReason(reason);
        return documentRepository.save(document);
    }

    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        // Delete the document record from database
        documentRepository.delete(document);
        
        // Note: File is kept in storage (as per requirement "uploaded files should not delete never")
        // If you want to delete the physical file too, uncomment below:
        // fileStorageService.deleteFile(document.getFilePath());
    }

    public void deleteDraftDocument(Long documentId, User student) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        if (!document.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own documents");
        }
        if (!Document.DocumentStatus.DRAFT.equals(document.getStatus())) {
            throw new RuntimeException("Cannot delete: Document has already been forwarded to mentor");
        }
        documentRepository.delete(document);
    }

    @Transactional
    public Document forwardToDeanFromDean(Long documentId, User targetDean, User currentDean) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (document.getDean() == null || !document.getDean().getId().equals(currentDean.getId())) {
            throw new RuntimeException("You are not authorized to forward this document");
        }

        document.setDean(targetDean);
        document.setStatus(Document.DocumentStatus.FORWARDED_TO_DEAN);
        document.setForwardedToDeanAt(LocalDateTime.now());

        return documentRepository.save(document);
    }
}
