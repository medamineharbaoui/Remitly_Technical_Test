package com.swiftcodes.swift_api.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CountrySwiftCodeResponse {

    private String countryISO2;
    private String countryName;
    private List<SwiftCodeDetail> swiftCodes;

    // Getters and Setters
    public String getCountryISO2() {
        return countryISO2;
    }

    public void setCountryISO2(String countryISO2) {
        this.countryISO2 = countryISO2;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public List<SwiftCodeDetail> getSwiftCodes() {
        return swiftCodes;
    }

    public void setSwiftCodes(List<SwiftCodeDetail> swiftCodes) {
        this.swiftCodes = swiftCodes;
    }

    // Inner class for SwiftCode details
    public static class SwiftCodeDetail {

        private String swiftCode;
        private String bankName;
        private String address;
        private String countryISO2;
        
        @JsonProperty("isHeadquarter")
        private boolean isHeadquarter;

        // Getters and Setters
        public String getSwiftCode() {
            return swiftCode;
        }

        public void setSwiftCode(String swiftCode) {
            this.swiftCode = swiftCode;
        }

        public String getBankName() {
            return bankName;
        }

        public void setBankName(String bankName) {
            this.bankName = bankName;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getCountryISO2() {
            return countryISO2;
        }

        public void setCountryISO2(String countryISO2) {
            this.countryISO2 = countryISO2;
        }

        @JsonProperty("isHeadquarter")
        public boolean isHeadquarter() {
            return isHeadquarter;
        }

        @JsonProperty("isHeadquarter")
        public void setHeadquarter(boolean isHeadquarter) {
            this.isHeadquarter = isHeadquarter;
        }
    }
}
