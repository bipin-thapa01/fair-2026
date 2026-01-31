package com.app.bridgeQuality;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BridgeGuardApplication {

	public static void main(String[] args) {
        io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
                .directory("backend")
                .ignoreIfMissing()
                .load();
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );
        SpringApplication.run(BridgeGuardApplication.class, args);
	}

}
