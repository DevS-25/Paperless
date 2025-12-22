package com.college.paperless.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(unique = true)
    private String username;

    private String password;

    @Column(nullable = false)
    private String name;

    @Column(name = "vtu_number")
    private String vtuNumber;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "year_of_study")
    private String yearOfStudy;

    @Column(name = "department")
    private String department;

    @Column(name = "tts_id")
    private String ttsId;

    @ElementCollection(targetClass = UserRole.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<UserRole> roles = new HashSet<>();

    // Legacy role column for migration
    @Enumerated(EnumType.STRING)
    @Column(name = "role", insertable = false, updatable = false)
    private UserRole legacyRole;

    @Transient
    public UserRole getRole() {
        if (roles != null && !roles.isEmpty()) {
            // Return HOD if present, else MENTOR, else first
            if (roles.contains(UserRole.HOD)) return UserRole.HOD;
            if (roles.contains(UserRole.DEAN)) return UserRole.DEAN;
            if (roles.contains(UserRole.ADMIN)) return UserRole.ADMIN;
            return roles.iterator().next();
        }
        // Fallback to legacy role if roles set is empty
        return legacyRole;
    }

    public void setRole(UserRole role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        this.roles.add(role);
    }

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(name = "signature_path")
    private String signaturePath;

    @Column(name = "hod_signature_path")
    private String hodSignaturePath;

    @Lob
    @Column(name = "signature_data", columnDefinition = "LONGBLOB")
    private byte[] signatureData;

    @Lob
    @Column(name = "hod_signature_data", columnDefinition = "LONGBLOB")
    private byte[] hodSignatureData;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum UserRole {
        STUDENT,
        FACULTY,
        MENTOR,
        HOD,
        ADMIN,
        DEAN,
        INDUSTRY_RELATIONS,
        RND,
        DEAN_ACADEMICS,
        REGISTRAR,
        COE,
        EXAM_CELL
    }
}
