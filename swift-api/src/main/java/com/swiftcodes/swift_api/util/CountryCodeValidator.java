package com.swiftcodes.swift_api.util;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class CountryCodeValidator {

    private final Set<String> validCodes = new HashSet<>();

    public boolean isValid(String code) {
        return validCodes.contains(code.toUpperCase());
    }

    @PostConstruct
    public void loadCountryCodes() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = getClass().getClassLoader().getResourceAsStream("data/countries-iso-2-codes.json");
            List<Country> countries = mapper.readValue(is, new TypeReference<List<Country>>() {});
            for (Country c : countries) {
                validCodes.add(c.getCode().toUpperCase());
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to load country codes", e);
        }
    }

    // Getter method to retrieve the Country object by country code
    public Country getCountryByCode(String countryISO2code) {
        try {
            InputStream is = getClass().getClassLoader().getResourceAsStream("data/countries-iso-2-codes.json");
            ObjectMapper mapper = new ObjectMapper();
            List<Country> countries = mapper.readValue(is, new TypeReference<List<Country>>() {});

            for (Country c : countries) {
                if (c.getCode().equalsIgnoreCase(countryISO2code)) {
                    return c;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error loading country data", e);
        }
        return null;
    }

    // Inner class to match JSON structure, remains private
    public static class Country {

        @JsonProperty("Name")
        private String name;

        @JsonProperty("Code")
        private String code;

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
