package com.swiftcodes.swift_api.service;

import com.swiftcodes.swift_api.entity.SwiftCode;
import com.swiftcodes.swift_api.repository.SwiftCodeRepository;
import com.swiftcodes.swift_api.util.SwiftFileParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class SwiftCodeImportService {

    @Autowired
    private SwiftCodeRepository swiftCodeRepository;

    @Autowired
    private SwiftFileParser parser;

    @Transactional
    public void importFromDefaultFile() throws IOException {
        // Load the resource as an InputStream using class loader
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream("data/Interns_2025_SWIFT_CODES-Sheet1.csv")) {
            if (inputStream == null) {
                throw new IOException("File not found in resources: data/Interns_2025_SWIFT_CODES-Sheet1.csv");
            }

            List<SwiftCode> codes = parser.parseCSV(inputStream);

            for (SwiftCode code : codes) {
                // Check if SwiftCode exists in the database before saving
                if (!swiftCodeRepository.existsBySwiftCode(code.getSwiftCode())) {
                    swiftCodeRepository.save(code);
                }
            }
        }
    }
}
