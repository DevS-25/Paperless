package com.college.paperless.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String fileType;

    @Column(nullable = false)
    private Long fileSize;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hod_id")
    private User hod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dean_id")
    private User dean;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dean_academics_id")
    private User deanAcademics;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrar_id")
    private User registrar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coe_id")
    private User coe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rnd_id")
    private User rnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_relations_id")
    private User industryRelations;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_cell_id")
    private User examCell;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private DocumentStatus status;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "forwarded_to_mentor_at")
    private LocalDateTime forwardedToMentorAt;

    @Column(name = "mentor_action_at")
    private LocalDateTime mentorActionAt;

    @Column(name = "forwarded_to_hod_at")
    private LocalDateTime forwardedToHodAt;

    @Column(name = "hod_action_at")
    private LocalDateTime hodActionAt;

    @Column(name = "forwarded_to_dean_at")
    private LocalDateTime forwardedToDeanAt;

    @Column(name = "dean_action_at")
    private LocalDateTime deanActionAt;

    @Column(name = "forwarded_to_dean_academics_at")
    private LocalDateTime forwardedToDeanAcademicsAt;

    @Column(name = "dean_academics_action_at")
    private LocalDateTime deanAcademicsActionAt;

    @Column(name = "forwarded_to_registrar_at")
    private LocalDateTime forwardedToRegistrarAt;

    @Column(name = "registrar_action_at")
    private LocalDateTime registrarActionAt;

    @Column(name = "forwarded_to_coe_at")
    private LocalDateTime forwardedToCoeAt;

    @Column(name = "forwarded_to_rnd_at")
    private LocalDateTime forwardedToRndAt;

    @Column(name = "forwarded_to_industry_relations_at")
    private LocalDateTime forwardedToIndustryRelationsAt;

    @Column(name = "forwarded_to_exam_cell_at")
    private LocalDateTime forwardedToExamCellAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
        if (status == null) {
            status = DocumentStatus.DRAFT;
        }
    }

    public enum DocumentStatus {
        DRAFT,
        FORWARDED_TO_MENTOR,
        APPROVED_BY_MENTOR,
        REJECTED_BY_MENTOR,
        FORWARDED_TO_HOD,
        APPROVED_BY_HOD,
        REJECTED_BY_HOD,
        FORWARDED_TO_DEAN,
        APPROVED_BY_DEAN,
        REJECTED_BY_DEAN,
        FORWARDED_TO_DEAN_ACADEMICS,
        APPROVED_BY_DEAN_ACADEMICS,
        REJECTED_BY_DEAN_ACADEMICS,
        FORWARDED_TO_REGISTRAR,
        APPROVED_BY_REGISTRAR,
        REJECTED_BY_REGISTRAR,
        FORWARDED_TO_COE,
        APPROVED_BY_COE,
        REJECTED_BY_COE,
        FORWARDED_TO_RND,
        APPROVED_BY_RND,
        REJECTED_BY_RND,
        FORWARDED_TO_INDUSTRY_RELATIONS,
        APPROVED_BY_INDUSTRY_RELATIONS,
        REJECTED_BY_INDUSTRY_RELATIONS,
        FORWARDED_TO_EXAM_CELL,
        APPROVED_BY_EXAM_CELL,
        REJECTED_BY_EXAM_CELL
    }
}
