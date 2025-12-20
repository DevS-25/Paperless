package com.college.paperless.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String name;

    private String vtuNumber;

    private String contactNumber;

    private String yearOfStudy;

    private String department;

    private String ttsId;
}
