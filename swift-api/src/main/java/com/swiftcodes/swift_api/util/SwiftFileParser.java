package com.swiftcodes.swift_api.util;

import com.swiftcodes.swift_api.entity.SwiftCode;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

@Component
public class SwiftFileParser {

    // Method to parse the CSV file and return a list of SwiftCode objects
    public List<SwiftCode> parseCSV(InputStream inputStream) throws IOException {
        List<SwiftCode> swiftCodes = new ArrayList<>();
        
        try (Reader reader = new InputStreamReader(inputStream)) {
            Iterable<CSVRecord> records = CSVFormat.DEFAULT.builder()
                    .setHeader("COUNTRY ISO2 CODE", "SWIFT CODE", "CODE TYPE", "NAME", "ADDRESS", "TOWN NAME", "COUNTRY NAME", "TIME ZONE")
                    .build()
                    .parse(reader);
            
            for (CSVRecord record : records) {
                SwiftCode code = new SwiftCode();
                code.setSwiftCode(record.get("SWIFT CODE"));
                code.setBankName(record.get("NAME"));
                code.setAddress(record.get("ADDRESS"));
                code.setTownName(record.get("TOWN NAME"));
                code.setCountryISO2(record.get("COUNTRY ISO2 CODE"));
                code.setCountryName(record.get("COUNTRY NAME"));
                
                // Check if the last 3 characters of the SWIFT code are "XXX"
                String swiftCode = record.get("SWIFT CODE");
                code.setHeadquarter(swiftCode != null && swiftCode.length() >= 3 && swiftCode.endsWith("XXX"));

                swiftCodes.add(code);
            }
        }
        
        return swiftCodes;
    }
}
