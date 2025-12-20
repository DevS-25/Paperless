package com.college.paperless.service;

import com.college.paperless.entity.User;
import com.college.paperless.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createOrUpdateUser(String email, String name, String googleId, String profilePicture) {
        // Normalize email to lowercase for consistency
        String normalizedEmail = email.toLowerCase().trim();

        Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(name);
            user.setGoogleId(googleId);
            user.setProfilePicture(profilePicture);
            return userRepository.save(user);
        } else {
            User newUser = new User();
            newUser.setEmail(normalizedEmail);  // Store normalized email
            newUser.setName(name);
            newUser.setGoogleId(googleId);
            newUser.setProfilePicture(profilePicture);

            // Assign role based on email pattern
            // Student: ends with 5 digits @veltech.edu.in (e.g. vtu12345@veltech.edu.in or 12345@veltech.edu.in)
            if (normalizedEmail.matches(".*\\d{5}@veltech\\.edu\\.in")) {
                newUser.setRole(User.UserRole.STUDENT);
            } else {
                // Faculty: any other email
                newUser.setRole(User.UserRole.FACULTY);
            }

            return userRepository.save(newUser);
        }
    }

    public Optional<User> findByEmail(String email) {
        // Normalize email for consistent lookup
        return userRepository.findByEmail(email.toLowerCase().trim());
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateProfile(User user, String name, String vtuNumber, String contactNumber, String yearOfStudy, String department, String ttsId) {
        if (name != null && !name.trim().isEmpty()) {
            user.setName(name);
        }
        if (vtuNumber != null) {
            user.setVtuNumber(vtuNumber);
        }
        if (contactNumber != null) {
            user.setContactNumber(contactNumber);
        }
        if (yearOfStudy != null) {
            user.setYearOfStudy(yearOfStudy);
        }
        if (department != null) {
            user.setDepartment(department);
        }
        if (ttsId != null) {
            user.setTtsId(ttsId);
        }
        return userRepository.save(user);
    }

    @Transactional
    public User updateSignature(User user, String signaturePath) {
        user.setSignaturePath(signaturePath);
        return userRepository.save(user);
    }

    @Transactional
    public User updateSignature(User user, String signaturePath, String role) {
        if ("HOD".equalsIgnoreCase(role)) {
            user.setHodSignaturePath(signaturePath);
        } else {
            user.setSignaturePath(signaturePath);
        }
        return userRepository.save(user);
    }

    public List<User> getAllMentors() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(User.UserRole.MENTOR) ||
                                user.getRoles().contains(User.UserRole.FACULTY) ||
                                user.getRoles().contains(User.UserRole.HOD))
                .toList();
    }

    public List<User> getMentorsByDepartment(String department) {
        if (department == null) {
            return getAllMentors();
        }
        return getAllMentors().stream()
                .filter(user -> department.equalsIgnoreCase(user.getDepartment()))
                .toList();
    }

    public Optional<User> getAnyHod() {
        return userRepository.findFirstByRolesContaining(User.UserRole.HOD);
    }

    public Optional<User> getAnyDean() {
        return userRepository.findFirstByRolesContaining(User.UserRole.DEAN);
    }

    public Optional<User> getDeanByDepartment(String department) {
        return userRepository.findFirstByRolesContainingAndDepartment(User.UserRole.DEAN, department);
    }

    public Optional<User> getAnyDeanAcademics() {
        return userRepository.findFirstByRolesContaining(User.UserRole.DEAN_ACADEMICS);
    }

    public Optional<User> getAnyRegistrar() {
        return userRepository.findFirstByRolesContaining(User.UserRole.REGISTRAR);
    }

    public Optional<User> getAnyCoe() {
        return userRepository.findFirstByRolesContaining(User.UserRole.COE);
    }

    public Optional<User> getAnyRnd() {
        return userRepository.findFirstByRolesContaining(User.UserRole.RND);
    }

    public Optional<User> getAnyIndustryRelations() {
        return userRepository.findFirstByRolesContaining(User.UserRole.INDUSTRY_RELATIONS);
    }

    public Optional<User> getAnyExamCell() {
        return userRepository.findFirstByRolesContaining(User.UserRole.EXAM_CELL);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
}
