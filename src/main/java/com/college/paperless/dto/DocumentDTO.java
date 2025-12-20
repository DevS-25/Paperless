package com.college.paperless.dto;

import com.college.paperless.entity.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String description;
    private String status;
    private String rejectionReason;
    private LocalDateTime uploadedAt;
    private LocalDateTime forwardedToMentorAt;
    private LocalDateTime mentorActionAt;
    private LocalDateTime forwardedToHodAt;
    private LocalDateTime hodActionAt;

    // Student Information
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String vtuNumber;
    private String contactNumber;
    private String yearOfStudy;
    private String studentDepartment;

    // Mentor Information
    private Long mentorId;
    private String mentorName;
    private String mentorContactNumber;

    // HOD Information
    private Long hodId;
    private String hodName;

    // Dean Information
    private Long deanId;
    private String deanName;

    // Dean Academics Information
    private Long deanAcademicsId;
    private String deanAcademicsName;

    // Registrar Information
    private Long registrarId;
    private String registrarName;

    // CoE Information
    private Long coeId;
    private String coeName;

    // R&D Information
    private Long rndId;
    private String rndName;

    // Industry Relations Information
    private Long industryRelationsId;
    private String industryRelationsName;

    // Exam Cell Information
    private Long examCellId;
    private String examCellName;

    // Timestamps for other roles
    private LocalDateTime forwardedToDeanAt;
    private LocalDateTime forwardedToDeanAcademicsAt;
    private LocalDateTime forwardedToRegistrarAt;
    private LocalDateTime forwardedToCoeAt;
    private LocalDateTime forwardedToRndAt;
    private LocalDateTime forwardedToIndustryRelationsAt;
    private LocalDateTime forwardedToExamCellAt;

    public static DocumentDTO fromEntity(Document document) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(document.getId());
        dto.setFileName(document.getFileName());
        dto.setFileType(document.getFileType());
        dto.setFileSize(document.getFileSize());
        dto.setDescription(document.getDescription());
        dto.setStatus(document.getStatus().name());
        dto.setRejectionReason(document.getRejectionReason());
        dto.setUploadedAt(document.getUploadedAt());
        dto.setForwardedToMentorAt(document.getForwardedToMentorAt());
        dto.setMentorActionAt(document.getMentorActionAt());
        dto.setForwardedToHodAt(document.getForwardedToHodAt());
        dto.setHodActionAt(document.getHodActionAt());
        dto.setForwardedToDeanAt(document.getForwardedToDeanAt());
        dto.setForwardedToDeanAcademicsAt(document.getForwardedToDeanAcademicsAt());
        dto.setForwardedToRegistrarAt(document.getForwardedToRegistrarAt());
        dto.setForwardedToCoeAt(document.getForwardedToCoeAt());
        dto.setForwardedToRndAt(document.getForwardedToRndAt());
        dto.setForwardedToIndustryRelationsAt(document.getForwardedToIndustryRelationsAt());
        dto.setForwardedToExamCellAt(document.getForwardedToExamCellAt());

        // Student Info
        if (document.getStudent() != null) {
            dto.setStudentId(document.getStudent().getId());
            dto.setStudentName(document.getStudent().getName());
            dto.setStudentEmail(document.getStudent().getEmail());
            dto.setVtuNumber(document.getStudent().getVtuNumber());
            dto.setContactNumber(document.getStudent().getContactNumber());
            dto.setYearOfStudy(document.getStudent().getYearOfStudy());
            dto.setStudentDepartment(document.getStudent().getDepartment());
        }

        if (document.getMentor() != null) {
            dto.setMentorId(document.getMentor().getId());
            dto.setMentorName(document.getMentor().getName());
            dto.setMentorContactNumber(document.getMentor().getContactNumber());
        }

        if (document.getHod() != null) {
            dto.setHodId(document.getHod().getId());
            dto.setHodName(document.getHod().getName());
        }

        // Dean Info
        if (document.getDean() != null) {
            dto.setDeanId(document.getDean().getId());
            dto.setDeanName(document.getDean().getName());
        }

        // Dean Academics Info
        if (document.getDeanAcademics() != null) {
            dto.setDeanAcademicsId(document.getDeanAcademics().getId());
            dto.setDeanAcademicsName(document.getDeanAcademics().getName());
        }

        // Registrar Info
        if (document.getRegistrar() != null) {
            dto.setRegistrarId(document.getRegistrar().getId());
            dto.setRegistrarName(document.getRegistrar().getName());
        }

        // CoE Info
        if (document.getCoe() != null) {
            dto.setCoeId(document.getCoe().getId());
            dto.setCoeName(document.getCoe().getName());
        }

        // R&D Info
        if (document.getRnd() != null) {
            dto.setRndId(document.getRnd().getId());
            dto.setRndName(document.getRnd().getName());
        }

        // Industry Relations Info
        if (document.getIndustryRelations() != null) {
            dto.setIndustryRelationsId(document.getIndustryRelations().getId());
            dto.setIndustryRelationsName(document.getIndustryRelations().getName());
        }

        // Exam Cell Info
        if (document.getExamCell() != null) {
            dto.setExamCellId(document.getExamCell().getId());
            dto.setExamCellName(document.getExamCell().getName());
        }

        return dto;
    }
}
