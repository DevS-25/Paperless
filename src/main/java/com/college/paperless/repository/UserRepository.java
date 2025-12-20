package com.college.paperless.repository;

import com.college.paperless.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    long countByRolesContaining(User.UserRole role);
    Optional<User> findFirstByRolesContaining(User.UserRole role);
    Optional<User> findFirstByRolesContainingAndDepartment(User.UserRole role, String department);
}
