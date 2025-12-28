package com.college.paperless.repository;

import com.college.paperless.entity.Document;
import com.college.paperless.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByStudent(User student);
    List<Document> findByStudentOrderByUploadedAtDesc(User student);
    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByStudentOrderByUploadedAtDesc(User student, Pageable pageable);

    List<Document> findByMentorAndStatusOrderByForwardedToMentorAtDesc(User mentor, Document.DocumentStatus status);
    List<Document> findByHodAndStatusOrderByForwardedToHodAtDesc(User hod, Document.DocumentStatus status);
    List<Document> findByMentorOrderByForwardedToMentorAtDesc(User mentor);
    List<Document> findByHodOrderByForwardedToHodAtDesc(User hod);
    
    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByHodAndStatusOrderByForwardedToHodAtDesc(User hod, Document.DocumentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByHodOrderByForwardedToHodAtDesc(User hod, Pageable pageable);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByMentorAndStatusOrderByForwardedToMentorAtDesc(User mentor, Document.DocumentStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByMentorOrderByForwardedToMentorAtDesc(User mentor, Pageable pageable);

    List<Document> findByDeanAndStatusOrderByForwardedToDeanAtDesc(User dean, Document.DocumentStatus status);
    
    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByDeanAndStatusOrderByForwardedToDeanAtDesc(User dean, Document.DocumentStatus status, Pageable pageable);

    List<Document> findByDeanOrderByForwardedToDeanAtDesc(User dean);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByDeanOrderByForwardedToDeanAtDesc(User dean, Pageable pageable);

    List<Document> findByDeanAcademicsAndStatusOrderByForwardedToDeanAcademicsAtDesc(User deanAcademics, Document.DocumentStatus status);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByDeanAcademicsAndStatusOrderByForwardedToDeanAcademicsAtDesc(User deanAcademics, Document.DocumentStatus status, Pageable pageable);

    List<Document> findByDeanAcademicsOrderByForwardedToDeanAcademicsAtDesc(User deanAcademics);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByDeanAcademicsOrderByForwardedToDeanAcademicsAtDesc(User deanAcademics, Pageable pageable);

    List<Document> findByRegistrarAndStatusOrderByForwardedToRegistrarAtDesc(User registrar, Document.DocumentStatus status);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByRegistrarAndStatusOrderByForwardedToRegistrarAtDesc(User registrar, Document.DocumentStatus status, Pageable pageable);

    List<Document> findByRegistrarOrderByForwardedToRegistrarAtDesc(User registrar);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByRegistrarOrderByForwardedToRegistrarAtDesc(User registrar, Pageable pageable);

    List<Document> findByCoeAndStatusOrderByForwardedToCoeAtDesc(User coe, Document.DocumentStatus status);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByCoeAndStatusOrderByForwardedToCoeAtDesc(User coe, Document.DocumentStatus status, Pageable pageable);

    List<Document> findByCoeOrderByForwardedToCoeAtDesc(User coe);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByCoeOrderByForwardedToCoeAtDesc(User coe, Pageable pageable);

    List<Document> findByRndAndStatusOrderByForwardedToRndAtDesc(User rnd, Document.DocumentStatus status);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByRndAndStatusOrderByForwardedToRndAtDesc(User rnd, Document.DocumentStatus status, Pageable pageable);

    List<Document> findByRndOrderByForwardedToRndAtDesc(User rnd);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByRndOrderByForwardedToRndAtDesc(User rnd, Pageable pageable);

    List<Document> findByIndustryRelationsAndStatusOrderByForwardedToIndustryRelationsAtDesc(User industryRelations, Document.DocumentStatus status);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByIndustryRelationsAndStatusOrderByForwardedToIndustryRelationsAtDesc(User industryRelations, Document.DocumentStatus status, Pageable pageable);

    List<Document> findByIndustryRelationsOrderByForwardedToIndustryRelationsAtDesc(User industryRelations);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByIndustryRelationsOrderByForwardedToIndustryRelationsAtDesc(User industryRelations, Pageable pageable);

    List<Document> findByExamCellAndStatusOrderByForwardedToExamCellAtDesc(User examCell, Document.DocumentStatus status);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByExamCellAndStatusOrderByForwardedToExamCellAtDesc(User examCell, Document.DocumentStatus status, Pageable pageable);

    List<Document> findByExamCellOrderByForwardedToExamCellAtDesc(User examCell);

    @EntityGraph(attributePaths = {"student", "mentor", "hod", "dean", "deanAcademics", "registrar", "coe", "rnd", "industryRelations", "examCell"})
    Page<Document> findAllByExamCellOrderByForwardedToExamCellAtDesc(User examCell, Pageable pageable);

    long countByStatusIn(List<Document.DocumentStatus> statuses);
}
