package com.productionhouse.crm.auth.service;

import com.productionhouse.crm.auth.api.ApiException;
import com.productionhouse.crm.auth.api.dto.AuthenticationResponse;
import com.productionhouse.crm.auth.api.dto.CurrentUserResponse;
import com.productionhouse.crm.auth.entity.CrmUser;
import com.productionhouse.crm.auth.entity.UserStatus;
import com.productionhouse.crm.auth.repository.UserRepository;
import com.productionhouse.crm.auth.security.CurrentUser;
import com.productionhouse.crm.auth.security.JwtTokenService;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import com.productionhouse.crm.systemadministration.roles.entity.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private static final String INVALID_CREDENTIALS = "Invalid email or password.";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService tokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService tokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional(readOnly = true)
    public AuthenticationResponse login(String email, String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw ApiException.unauthorized(INVALID_CREDENTIALS);
        }
        CrmUser user = userRepository.findByEmailIgnoreCase(email.trim())
                .filter(candidate -> candidate.getStatus() == UserStatus.ACTIVE)
                .filter(candidate -> candidate.getPasswordHash() != null
                        && passwordEncoder.matches(password, candidate.getPasswordHash()))
                .orElseThrow(() -> ApiException.unauthorized(INVALID_CREDENTIALS));
        return new AuthenticationResponse(
                tokenService.issue(user.getId(), user.getTokenVersion()),
                "Bearer",
                tokenService.expirationSeconds(),
                toResponse(user)
        );
    }

    @Transactional
    public void logout(CurrentUser currentUser) {
        CrmUser user = findUser(currentUser.id());
        user.incrementTokenVersion();
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse profile(CurrentUser currentUser) {
        return toResponse(findUser(currentUser.id()));
    }

    @Transactional
    public void changePassword(CurrentUser currentUser, String currentPassword, String newPassword) {
        validateBcryptPasswordLength(currentPassword);
        validateBcryptPasswordLength(newPassword);
        CrmUser user = findUser(currentUser.id());
        if (user.getPasswordHash() == null || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect.");
        }
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw ApiException.badRequest("New password must differ from the current password.");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.incrementTokenVersion();
        userRepository.save(user);
    }

    @Transactional
    public void acceptInvitation(String email, String token, String password) {
        validateBcryptPasswordLength(password);
        String tokenHash = hashToken(token);
        CrmUser user = userRepository.findByEmailIgnoreCase(email.trim())
                .filter(candidate -> candidate.getStatus() == UserStatus.INVITED)
                .filter(candidate -> tokenHash.equals(candidate.getInvitationTokenHash()))
                .filter(candidate -> candidate.getInvitationExpiresAt() != null
                        && candidate.getInvitationExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> ApiException.badRequest("Invitation is invalid or expired."));
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setStatus(UserStatus.ACTIVE);
        user.setInvitationTokenHash(null);
        user.setInvitationExpiresAt(null);
        userRepository.save(user);
    }

    public String createInvitationToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Could not hash invitation token.", exception);
        }
    }

    private void validateBcryptPasswordLength(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw ApiException.badRequest("Password must not exceed 72 UTF-8 bytes.");
        }
    }

    public CurrentUserResponse toResponse(CrmUser user) {
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .sorted()
                .toList();
        List<String> permissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::name)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return new CurrentUserResponse(user.getId(), user.getName(), user.getEmail(), roles, permissions);
    }

    private CrmUser findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication is no longer valid."));
    }
}
