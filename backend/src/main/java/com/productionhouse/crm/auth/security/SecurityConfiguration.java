package com.productionhouse.crm.auth.security;

import tools.jackson.databind.ObjectMapper;
import com.productionhouse.crm.auth.api.ApiError;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(12);
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, BearerTokenFilter bearerTokenFilter,
			ObjectMapper objectMapper, CorsConfigurationSource corsConfigurationSource) throws Exception {
		http.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers("/api/auth/login", "/api/auth/invitations/accept",
								"/api/production/**",
								"/api/finance/**").permitAll()
						.requestMatchers(
								"/api/auth/**",
								"/api/dashboard",
								"/api/dashboard/**",
								"/api/users/**",
								"/api/roles/**",
								"/api/departments/**",
								"/api/settings/**",
								"/api/mediahouse/**",
								"/api/audio/**",
								"/api/legal/**"
						).authenticated()
						.requestMatchers("/api/**").permitAll()
						.anyRequest().permitAll())
				.exceptionHandling(errors -> errors
						.authenticationEntryPoint((request, response, exception) -> writeError(response, objectMapper,
								HttpStatus.UNAUTHORIZED, "Authentication is required.", request.getRequestURI()))
						.accessDeniedHandler((request, response, exception) -> writeError(response, objectMapper,
								HttpStatus.FORBIDDEN, "You do not have permission to perform this action.",
								request.getRequestURI())))
				.addFilterBefore(bearerTokenFilter, UsernamePasswordAuthenticationFilter.class)
				.httpBasic(basic -> basic.disable()).formLogin(form -> form.disable());
		return http.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(
			@Value("${crm.web.allowed-origins:*}") String allowedOrigins) {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(List.of("*"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setExposedHeaders(List.of("*"));
		configuration.setAllowCredentials(false);
		configuration.setMaxAge(3600L);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	private static void writeError(HttpServletResponse response, ObjectMapper objectMapper, HttpStatus status,
			String message, String path) throws IOException {
		response.setStatus(status.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		objectMapper.writeValue(response.getOutputStream(),
				new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message, path, Map.of()));
	}
}
