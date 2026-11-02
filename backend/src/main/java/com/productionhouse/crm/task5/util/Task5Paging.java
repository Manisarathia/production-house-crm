package com.productionhouse.crm.task5.util;

import com.productionhouse.crm.auth.api.ApiException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

/** Bounds and slices the filtered Task 5 result sets. */
public final class Task5Paging {
    private Task5Paging() {}

    public static <T> Page<T> page(List<T> items, int page, int size) {
        if (page < 0 || size < 1 || size > 100) {
            throw ApiException.badRequest("page must be nonnegative and size must be between 1 and 100.");
        }
        int from = (int) Math.min((long) page * size, items.size());
        int to = Math.min(from + size, items.size());
        return new PageImpl<>(items.subList(from, to), PageRequest.of(page, size), items.size());
    }
}
