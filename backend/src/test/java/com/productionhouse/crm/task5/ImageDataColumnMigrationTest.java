package com.productionhouse.crm.task5;

import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ImageDataColumnMigrationTest {
    @Test
    void imageDataLimitFitsBase64ForMaximumSupportedUpload() {
        long encodedFileSize = 4L * ((ImageDataLimits.MAX_IMAGE_FILE_BYTES + 2L) / 3L);
        assertThat(encodedFileSize + 64).isLessThanOrEqualTo(ImageDataLimits.MAX_IMAGE_DATA_CHARS);
    }

    @Test
    void widensAllSixExistingColumnsWithoutDroppingData() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData metadata = mock(DatabaseMetaData.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metadata);
        when(metadata.getDatabaseProductName()).thenReturn("MySQL");
        when(jdbcTemplate.query(anyString(), any(RowMapper.class), anyString()))
                .thenReturn(List.of("tinytext"));

        new ImageDataColumnMigration(dataSource, jdbcTemplate).run(new DefaultApplicationArguments());

        var statements = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(jdbcTemplate, times(6)).execute(statements.capture());
        assertThat(statements.getAllValues())
                .allSatisfy(sql -> {
                    assertThat(sql).contains("MODIFY COLUMN `image_data` LONGTEXT NULL");
                    assertThat(sql).doesNotContain("DROP", "DELETE", "TRUNCATE");
                });
    }

    @Test
    void leavesAlreadyWidenedColumnsUntouched() throws Exception {
        DataSource dataSource = mock(DataSource.class);
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        Connection connection = mock(Connection.class);
        DatabaseMetaData metadata = mock(DatabaseMetaData.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getMetaData()).thenReturn(metadata);
        when(metadata.getDatabaseProductName()).thenReturn("MySQL");
        when(jdbcTemplate.query(anyString(), any(RowMapper.class), anyString()))
                .thenReturn(List.of("longtext"));

        new ImageDataColumnMigration(dataSource, jdbcTemplate).run(new DefaultApplicationArguments());

        verify(jdbcTemplate, times(6)).query(anyString(), any(RowMapper.class), anyString());
        verify(jdbcTemplate, org.mockito.Mockito.never()).execute(anyString());
    }
}
