package com.college.paperless.config;

import com.college.paperless.entity.User;
import com.college.paperless.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class RoleMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("Starting role migration...");
        List<User> users = userRepository.findAll();
        int migratedCount = 0;

        for (User user : users) {
            // Access legacyRole via reflection or if we made it public/getter.
            // Since I made it private and didn't add a getter, I should add a getter or use the field directly if I can.
            // But wait, I can just use the getRole() method I updated!
            // getRole() returns legacyRole if roles is empty.

            if (user.getRoles().isEmpty()) {
                User.UserRole legacyRole = user.getRole(); // This will fetch legacyRole due to my change
                if (legacyRole != null) {
                    user.setRole(legacyRole); // This adds to the set
                    userRepository.save(user);
                    migratedCount++;
                }
            }
        }
        System.out.println("Role migration completed. Migrated users: " + migratedCount);
    }
}

