package com.productionhouse.crm.auth.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.stereotype.Service;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Service
public class JwtTokenService {
    private static final String ISSUER = "production-house-crm";
    private static final long EXPIRATION_SECONDS = 900;

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;

    public JwtTokenService(@Value("${crm.auth.jwt-secret:}") String configuredSecret) {
        if (configuredSecret == null || configuredSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("CRM_AUTH_JWT_SECRET must contain at least 32 UTF-8 bytes.");
        }
        SecretKeySpec secretKey = new SecretKeySpec(configuredSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        jwtDecoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(ISSUER));
        this.decoder = jwtDecoder;
    }

    public String issue(Long userId, long tokenVersion) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(userId.toString())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(EXPIRATION_SECONDS))
                .claim("ver", tokenVersion)
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public TokenClaims verify(String token) {
        try {
            Jwt jwt = decoder.decode(token);
            Object tokenVersion = jwt.getClaims().get("ver");
            if (!(tokenVersion instanceof Number version)) {
                throw new IllegalArgumentException("Invalid token version.");
            }
            return new TokenClaims(Long.parseLong(jwt.getSubject()), version.longValue());
        } catch (JwtException | IllegalArgumentException | ClassCastException exception) {
            throw new InvalidTokenException();
        }
    }

    public long expirationSeconds() {
        return EXPIRATION_SECONDS;
    }

    public record TokenClaims(Long userId, long tokenVersion) {
    }

    public static class InvalidTokenException extends RuntimeException {
    }
}
