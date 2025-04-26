package com.swiftcodes.swift_api.config;

import com.swiftcodes.swift_api.service.SwiftCodeImportService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SwiftCodeDataInitializer implements CommandLineRunner {

    private final SwiftCodeImportService importService;

    public SwiftCodeDataInitializer(SwiftCodeImportService importService) {
        this.importService = importService;
    }

    @Override
    public void run(String... args) throws Exception {
        importService.importFromDefaultFile();
        System.out.println("SWIFT codes imported from CSV.");
    }
}
