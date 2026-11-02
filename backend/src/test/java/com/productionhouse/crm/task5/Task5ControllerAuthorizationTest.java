package com.productionhouse.crm.task5;

import com.productionhouse.crm.audio.dubbing.api.DubbingSessionController;
import com.productionhouse.crm.audio.singer.api.SingerProfileController;
import com.productionhouse.crm.legal.contracts.api.ContractRecordController;
import com.productionhouse.crm.legal.rights.api.ContentRightController;
import com.productionhouse.crm.mediahouse.media.api.MediaAssetController;
import com.productionhouse.crm.mediahouse.postproduction.api.PostProductionTaskController;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Task5ControllerAuthorizationTest {
    @Test
    void allTask5CrudOperationsRetainTheirReadWriteAndDeleteAuthorities() {
        assertAuthorities(MediaAssetController.class, "MEDIA");
        assertAuthorities(PostProductionTaskController.class, "POSTPRODUCTION");
        assertAuthorities(SingerProfileController.class, "SINGER");
        assertAuthorities(DubbingSessionController.class, "DUBBING");
        assertAuthorities(ContractRecordController.class, "CONTRACT");
        assertAuthorities(ContentRightController.class, "RIGHTS");
    }

    private void assertAuthorities(Class<?> controller, String prefix) {
        List<String> permissions = Arrays.stream(controller.getDeclaredMethods())
                .map(method -> method.getAnnotation(PreAuthorize.class))
                .filter(annotation -> annotation != null)
                .map(PreAuthorize::value)
                .toList();
        assertTrue(permissions.contains("hasAuthority('%s_READ')".formatted(prefix)));
        assertTrue(permissions.contains("hasAuthority('%s_WRITE')".formatted(prefix)));
        assertTrue(permissions.contains("hasAuthority('%s_DELETE')".formatted(prefix)));
        assertEquals(5, permissions.size());
    }
}
