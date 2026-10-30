package com.productionhouse.crm;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
		"spring.datasource.url=${spring.datasource.jdbc-url}",
		"spring.datasource.jdbc-url=jdbc:h2:mem:task1-context;MODE=MySQL;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=update",
		"crm.auth.jwt-secret=task1-test-signing-secret-with-at-least-32-bytes",
		"crm.settings.encryption-key=task1-test-encryption-secret-with-at-least-32-bytes"
})
class ProductionHouseCrmApplicationTests {

	@Test
	void contextLoads() {
	}

}
