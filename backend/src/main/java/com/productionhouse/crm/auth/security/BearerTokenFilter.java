package com.productionhouse.crm.auth.security;

import com.productionhouse.crm.auth.api.ApiError;
import com.productionhouse.crm.auth.entity.CrmUser;
import com.productionhouse.crm.auth.entity.UserStatus;
import com.productionhouse.crm.auth.repository.UserRepository;
import com.productionhouse.crm.systemadministration.roles.entity.Permission;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@Component
public class BearerTokenFilter extends OncePerRequestFilter {
    private final JwtTokenService tokenService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public BearerTokenFilter(
            JwtTokenService tokenService,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.tokenService = tokenService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            try {
                JwtTokenService.TokenClaims claims = tokenService.verify(authorization.substring(7));
                CrmUser user = userRepository.findById(claims.userId()).orElse(null);
                if (user == null || user.getStatus() != UserStatus.ACTIVE
                        || user.getTokenVersion() != claims.tokenVersion()) {
                    SecurityContextHolder.clearContext();
                    writeUnauthorized(response, request);
                    return;
                }
                CurrentUser principal = CurrentUser.from(user);
                List<SimpleGrantedAuthority> authorities = principal.permissions().stream()
                        .map(Permission::name)
                        .map(SimpleGrantedAuthority::new)
                        .toList();
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(principal, null, authorities)
                );
            } catch (JwtTokenService.InvalidTokenException exception) {
                SecurityContextHolder.clearContext();
                writeUnauthorized(response, request);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void writeUnauthorized(HttpServletResponse response, HttpServletRequest request) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        objectMapper.writeValue(response.getOutputStream(), new ApiError(
                Instant.now(),
                HttpServletResponse.SC_UNAUTHORIZED,
                "Unauthorized",
                "Invalid or expired authentication.",
                request.getRequestURI(),
                java.util.Map.of()
        ));
    }
}
