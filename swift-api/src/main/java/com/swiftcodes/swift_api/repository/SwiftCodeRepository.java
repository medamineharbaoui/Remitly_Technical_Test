package com.swiftcodes.swift_api.repository;

import com.swiftcodes.swift_api.entity.SwiftCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SwiftCodeRepository extends JpaRepository<SwiftCode, String> {

    // Custom method to find a SwiftCode by swiftCode
    Optional<SwiftCode> findBySwiftCode(String swiftCode);

    // Custom method to find all SwiftCodes by country ISO2
    List<SwiftCode> findByCountryISO2(String countryISO2);

    // Custom method to delete a SwiftCode by swiftCode
    void deleteBySwiftCode(String swiftCode);

    // Custom method to check if a SwiftCode exists by swiftCode
    boolean existsBySwiftCode(String swiftCode);

    // Custom method to find all SwiftCodes that start with a specific base code (same branch)
    List<SwiftCode> findBySwiftCodeStartingWithAndSwiftCodeNot(String baseCode, String excludeSwiftCode);


}
