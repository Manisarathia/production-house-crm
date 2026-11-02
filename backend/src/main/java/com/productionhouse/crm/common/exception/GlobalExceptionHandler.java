package com.productionhouse.crm.common.exception;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> errorPayload = new HashMap<>();
        errorPayload.put("timestamp", LocalDateTime.now().toString());
        errorPayload.put("status", HttpStatus.BAD_REQUEST.value());
        errorPayload.put("error", "Validation Failed");
        errorPayload.put("message", ex.getMessage());

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            fieldErrors.put(error.getField(), error.getDefaultMessage())
        );
        errorPayload.put("details", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorPayload);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, ConstraintViolationException.class})
    public ResponseEntity<Map<String, Object>> handleDatabaseConstraints(Exception ex) {
        Map<String, Object> errorPayload = new HashMap<>();
        errorPayload.put("timestamp", LocalDateTime.now().toString());
        errorPayload.put("status", HttpStatus.CONFLICT.value());
        errorPayload.put("error", "Database Constraint Violation");
        
        errorPayload.put("message", "Operation declined: A mandatory tracking column field is missing or contains invalid data lengths.");

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorPayload);
    }
}
