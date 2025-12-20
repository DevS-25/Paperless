package com.college.paperless.dto;

import com.college.paperless.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String vtuNumber;
    private String contactNumber;
    private String yearOfStudy;
    private String department;
    private String ttsId;
    private String role;
    private List<String> roles;
    private String profilePicture;

    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setVtuNumber(user.getVtuNumber());
        dto.setContactNumber(user.getContactNumber());
        dto.setYearOfStudy(user.getYearOfStudy());
        dto.setDepartment(user.getDepartment());
        dto.setTtsId(user.getTtsId());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setRoles(user.getRoles().stream().map(Enum::name).collect(Collectors.toList()));
        dto.setProfilePicture(user.getProfilePicture());
        return dto;
    }
}
