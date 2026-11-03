package com.productionhouse.crm.task5;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.util.List;
import java.util.Locale;

@Component
public class ImageDataColumnMigration implements ApplicationRunner {
    private static final List<String> TABLES = List.of(
            "crm_media_postproduction",
            "crm_media_media",
            "crm_media_singer",
            "crm_media_dubbing",
            "crm_media_contracts",
            "crm_media_rights"
    );

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public ImageDataColumnMigration(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        try (var connection = dataSource.getConnection()) {
            if (!"MySQL".equalsIgnoreCase(connection.getMetaData().getDatabaseProductName())) {
                return;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Could not inspect MySQL image_data columns.", exception);
        }

        for (String table : TABLES) {
            List<String> types = jdbcTemplate.query(
                    "SELECT DATA_TYPE FROM information_schema.columns "
                            + "WHERE table_schema = DATABASE() AND table_name = ? AND column_name = 'image_data'",
                    (resultSet, rowNum) -> resultSet.getString(1),
                    table
            );
            if (types.size() != 1) {
                throw new IllegalStateException(
                        "Expected one image_data column in MySQL table " + table + ", found " + types.size() + "."
                );
            }
            if (!"longtext".equals(types.get(0).toLowerCase(Locale.ROOT))) {
                jdbcTemplate.execute("ALTER TABLE `" + table + "` MODIFY COLUMN `image_data` LONGTEXT NULL");
            }
        }
    }
}
