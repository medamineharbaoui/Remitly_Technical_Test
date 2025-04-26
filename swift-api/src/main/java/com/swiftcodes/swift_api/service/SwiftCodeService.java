package com.swiftcodes.swift_api.service;

import com.swiftcodes.swift_api.entity.SwiftCode;
import com.swiftcodes.swift_api.repository.SwiftCodeRepository;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SwiftCodeService {

    @Autowired
    private SwiftCodeRepository swiftCodeRepository;

    // Method to check if a SwiftCode exists by swiftCode (string)
    public boolean existsBySwiftCode(String swiftCode) {
        return swiftCodeRepository.existsBySwiftCode(swiftCode);
    }
    

    // Method to get SwiftCode by swiftCode (string)
    public Optional<SwiftCode> getSwiftCodeByCode(String swiftCode) {
        return swiftCodeRepository.findBySwiftCode(swiftCode);
    }

    // Method to get all SwiftCodes for a given country ISO2 code
    public List<SwiftCode> getSwiftCodesByCountry(String countryISO2) {
        return swiftCodeRepository.findByCountryISO2(countryISO2);
    }

    // Method to add SwiftCode
    public SwiftCode addSwiftCode(SwiftCode swiftCode) {
        return swiftCodeRepository.save(swiftCode);
    }

    // Method to delete SwiftCode by swiftCode

    public void deleteSwiftCode(String swiftCode) {
        swiftCodeRepository.deleteBySwiftCode(swiftCode);
    }

    // Method to get all SwiftCodes that begin with a specific base code
    public List<SwiftCode> findBranchesByBaseCode(String baseCode, String excludeSwiftCode) {
        return swiftCodeRepository.findBySwiftCodeStartingWithAndSwiftCodeNot(baseCode, excludeSwiftCode);
    }
    
}
