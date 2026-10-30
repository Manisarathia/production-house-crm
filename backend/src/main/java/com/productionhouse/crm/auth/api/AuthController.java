package com.productionhouse.crm.auth.api;

import com.productionhouse.crm.auth.api.dto.AcceptInvitationRequest;
import com.productionhouse.crm.auth.api.dto.AuthenticationResponse;
import com.productionhouse.crm.auth.api.dto.ChangePasswordRequest;
import com.productionhouse.crm.auth.api.dto.CurrentUserResponse;
import com.productionhouse.crm.auth.api.dto.LoginRequest;
import com.productionhouse.crm.auth.security.CurrentUser;
import com.productionhouse.crm.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthenticationResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @PostMapping("/invitations/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void acceptInvitation(@Valid @RequestBody AcceptInvitationRequest request) {
        authService.acceptInvitation(request.email(), request.token(), request.password());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@AuthenticationPrincipal CurrentUser currentUser) {
        authService.logout(currentUser);
    }

    @GetMapping("/me")
    public CurrentUserResponse profile(@AuthenticationPrincipal CurrentUser currentUser) {
        return authService.profile(currentUser);
    }

    @PostMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @AuthenticationPrincipal CurrentUser currentUser,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(currentUser, request.currentPassword(), request.newPassword());
    }
}
