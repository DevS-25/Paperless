package com.college.paperless.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentActionRequest {
    @NotNull
    private Long documentId;

    private String action; // "approve", "reject", "forward_to_hod"

    private String rejectionReason;

    private Long mentorId; // For forwarding to mentor

    private Long targetUserId; // Generic field for forwarding to specific user (HOD, Dean, etc.)
}
