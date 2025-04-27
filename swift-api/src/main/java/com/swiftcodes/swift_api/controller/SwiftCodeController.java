package com.swiftcodes.swift_api.controller;

import com.swiftcodes.swift_api.dto.CountrySwiftCodeResponse;
import com.swiftcodes.swift_api.entity.SwiftCode;
import com.swiftcodes.swift_api.service.SwiftCodeImportService;
import com.swiftcodes.swift_api.service.SwiftCodeService;
import com.swiftcodes.swift_api.util.CountryCodeValidator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/v1/swift-codes")
public class SwiftCodeController {

    @Autowired
    private SwiftCodeService swiftCodeService;
    @Autowired
    private CountryCodeValidator countryCodeValidator;
    @Autowired
    private SwiftCodeImportService swiftCodeImportService;

    // Endpoint 1: Retrieve details of a single SWIFT code
    @GetMapping("/{swiftCode}")
    public ResponseEntity<?> getSwiftCodeByCode(@PathVariable String swiftCode) {
        String upperCode = swiftCode.toUpperCase();

        // Length check
        if (upperCode.length() != 11) {
            return ResponseEntity.badRequest().body(Map.of("message", "SWIFT code must be 11 characters long."));
        }

        // Regex pattern check
        if (!upperCode.matches("^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "SWIFT code format is invalid."));
        }

        Optional<SwiftCode> swiftCodeOpt = swiftCodeService.getSwiftCodeByCode(upperCode);

        if (swiftCodeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "SWIFT code not found."));
        }

        SwiftCode codeDetails = swiftCodeOpt.get();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("address", codeDetails.getAddress());
        response.put("bankName", codeDetails.getBankName());
        response.put("countryISO2", codeDetails.getCountryISO2());
        response.put("countryName", codeDetails.getCountryName());
        response.put("isHeadquarter", codeDetails.isHeadquarter());
        response.put("swiftCode", codeDetails.getSwiftCode());

        // If headquarter (ends with XXX), include branches
        if (upperCode.endsWith("XXX")) {
            String baseCode = upperCode.substring(0, 8);
            List<SwiftCode> branches = swiftCodeService.findBranchesByBaseCode(baseCode, upperCode);

            if (branches.isEmpty()) {
                response.put("message", "No branches found for this headquarter.");
                response.put("branches", Collections.emptyList());
            } else {
                List<Map<String, Object>> branchList = branches.stream()
                        .map(this::mapBranch)
                        .collect(Collectors.toList());
                response.put("branches", branchList);
            }
        }

        return ResponseEntity.ok(response);
    }

    // Endpoint 2: Return all SWIFT codes for a specific country
    @GetMapping("/country/{countryISO2code}")
    public ResponseEntity<?> getSwiftCodesByCountry(@PathVariable String countryISO2code) {
        String upperCode = countryISO2code.toUpperCase();

        // Validate country code
        if (!countryCodeValidator.isValid(upperCode)) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid country code.");
            return ResponseEntity.badRequest().body(response);
        }

        // Fetch swift codes for the given country ISO code
        List<SwiftCode> result = swiftCodeService.getSwiftCodesByCountry(upperCode);

        // Check if no swift codes are found
        if (result.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "No SWIFT codes found for country code " + upperCode);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Prepare the response DTO
        CountrySwiftCodeResponse responseDto = new CountrySwiftCodeResponse();
        responseDto.setCountryISO2(upperCode);

        // Set country name if available
        CountryCodeValidator.Country country = countryCodeValidator.getCountryByCode(upperCode);
        responseDto.setCountryName(country != null ? country.getName() : "Unknown");

        // Map the result to SwiftCodeDetail
        List<CountrySwiftCodeResponse.SwiftCodeDetail> swiftCodeDetails = result.stream().map(swiftCode -> {
            CountrySwiftCodeResponse.SwiftCodeDetail detail = new CountrySwiftCodeResponse.SwiftCodeDetail();
            detail.setSwiftCode(swiftCode.getSwiftCode());
            detail.setBankName(swiftCode.getBankName());
            detail.setAddress(swiftCode.getAddress());
            detail.setCountryISO2(swiftCode.getCountryISO2());
            detail.setHeadquarter(swiftCode.isHeadquarter());
            return detail;
        }).collect(Collectors.toList());

        responseDto.setSwiftCodes(swiftCodeDetails);

        return ResponseEntity.ok(responseDto);
    }

    // Endpoint 3: Add a new SWIFT code 
    @PostMapping
public ResponseEntity<?> addSwiftCode(@RequestBody SwiftCode swiftCode) {
    String swift = swiftCode.getSwiftCode().toUpperCase();
    String iso2 = swiftCode.getCountryISO2().toUpperCase();

    // Validate SWIFT code format (11 characters, proper pattern) 
    // can be this if we want to make sure that matches a real swiftcode pattern : 
    // but this is not required in this test "^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$"
    if ((swift.length() != 11) ||
            !swift.matches("^[A-Z0-9]{11}$")) {
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid SWIFT code format."));
    }

    // Validate country ISO2 code
    if (!countryCodeValidator.isValid(iso2)) {
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid country ISO2 code."));
    }

    // Validate country name matches ISO2 code
    CountryCodeValidator.Country country = countryCodeValidator.getCountryByCode(iso2);
    if (country == null || !country.getName().equalsIgnoreCase(swiftCode.getCountryName())) {
        return ResponseEntity.badRequest().body(Map.of("message", "Country name does not match the ISO2 code."));
    }

    // Check if SWIFT code already exists
    if (swiftCodeService.existsBySwiftCode(swift)) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "SWIFT code already exists."));
    }

    // ✅ Validate headquarter consistency
    boolean endsWithXXX = swift.endsWith("XXX");
    boolean isHQ = swiftCode.isHeadquarter(); 

    if (endsWithXXX && !isHQ) {
        return ResponseEntity.badRequest().body(Map.of(
            "message", "SWIFT code ending with 'XXX' indicates a headquarter. Please set headquarter = true."
        ));
    }

    if (!endsWithXXX && isHQ) {
        return ResponseEntity.badRequest().body(Map.of(
            "message", "SWIFT code not ending with 'XXX' indicates a branch. Please set headquarter = false."
        ));
    }

    // All good — save the SWIFT code
    swiftCode.setSwiftCode(swift);
    swiftCode.setCountryISO2(iso2);
    SwiftCode savedSwiftCode = swiftCodeService.addSwiftCode(swiftCode);

    return ResponseEntity.status(HttpStatus.CREATED).body(savedSwiftCode);
}


    // Endpoint 4: Delete a SWIFT code
    @DeleteMapping("/{swiftCode}")
    public ResponseEntity<?> deleteSwiftCode(@PathVariable String swiftCode) {
        String upperSwift = swiftCode.toUpperCase();

        // Validate SWIFT code format (11 characters, proper pattern)
        if ((upperSwift.length() != 11) ||
                !upperSwift.matches("^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid SWIFT code format."));
        }

        // Check if SWIFT code exists
        boolean exists = swiftCodeService.existsBySwiftCode(upperSwift);
        if (!exists) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "SWIFT code not found: " + upperSwift));
        }

        // Proceed to delete
        swiftCodeService.deleteSwiftCode(upperSwift);
        return ResponseEntity.ok(Map.of("message", "SWIFT code deleted successfully."));
    }

    // Endpoint 5: Import SWIFT codes from a CSV file
    @PostMapping("/import")
    public ResponseEntity<?> importSwiftCodes() {
        try {
            swiftCodeImportService.importFromDefaultFile();
            return ResponseEntity.ok("SWIFT codes imported from CSV.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Import failed: " + e.getMessage());
        }
    }

    // Helper method to map a SwiftCode object to a branch map
    private Map<String, Object> mapBranch(SwiftCode branch) {
        Map<String, Object> branchMap = new HashMap<>();
        branchMap.put("address", branch.getAddress());
        branchMap.put("bankName", branch.getBankName());
        branchMap.put("countryISO2", branch.getCountryISO2());
        branchMap.put("isHeadquarter", branch.isHeadquarter());
        branchMap.put("swiftCode", branch.getSwiftCode());
        return branchMap;
    }

}
