package com.college.paperless.repository;

import com.college.paperless.entity.Document;
import com.college.paperless.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByStudent(User student);
    List<Document> findByStudentOrderByUploadedAtDesc(User student);
    List<Document> findByMentorAndStatusOrderByForwardedToMentorAtDesc(User mentor, Document.DocumentStatus status);
    List<Document> findByHodAndStatusOrderByForwardedToHodAtDesc(User hod, Document.DocumentStatus status);
    List<Document> findByMentorOrderByForwardedToMentorAtDesc(User mentor);
    List<Document> findByHodOrderByForwardedToHodAtDesc(User hod);
    List<Document> findByDeanAndStatusOrderByForwardedToDeanAtDesc(User dean, Document.DocumentStatus status);
    List<Document> findByDeanOrderByForwardedToDeanAtDesc(User dean);
    List<Document> findByDeanAcademicsAndStatusOrderByForwardedToDeanAcademicsAtDesc(User deanAcademics, Document.DocumentStatus status);
    List<Document> findByDeanAcademicsOrderByForwardedToDeanAcademicsAtDesc(User deanAcademics);
    List<Document> findByRegistrarAndStatusOrderByForwardedToRegistrarAtDesc(User registrar, Document.DocumentStatus status);
    List<Document> findByRegistrarOrderByForwardedToRegistrarAtDesc(User registrar);

    List<Document> findByCoeAndStatusOrderByForwardedToCoeAtDesc(User coe, Document.DocumentStatus status);
    List<Document> findByCoeOrderByForwardedToCoeAtDesc(User coe);

    List<Document> findByRndAndStatusOrderByForwardedToRndAtDesc(User rnd, Document.DocumentStatus status);
    List<Document> findByRndOrderByForwardedToRndAtDesc(User rnd);

    List<Document> findByIndustryRelationsAndStatusOrderByForwardedToIndustryRelationsAtDesc(User industryRelations, Document.DocumentStatus status);
    List<Document> findByIndustryRelationsOrderByForwardedToIndustryRelationsAtDesc(User industryRelations);

    List<Document> findByExamCellAndStatusOrderByForwardedToExamCellAtDesc(User examCell, Document.DocumentStatus status);
    List<Document> findByExamCellOrderByForwardedToExamCellAtDesc(User examCell);

    long countByStatusIn(List<Document.DocumentStatus> statuses);
}
