package com.swiftcodes.swift_api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swiftcodes.swift_api.entity.SwiftCode;
import com.swiftcodes.swift_api.service.SwiftCodeService;
import com.swiftcodes.swift_api.util.CountryCodeValidator;

import org.springframework.http.MediaType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

public class SwiftCodeControllerTest {

    private MockMvc mockMvc;

    @Mock
    private SwiftCodeService swiftCodeService;
    @Mock
    private CountryCodeValidator countryCodeValidator;

    @InjectMocks
    private SwiftCodeController swiftCodeController;

    private SwiftCode swiftCode;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(swiftCodeController).build();

        swiftCode = new SwiftCode();
        swiftCode.setSwiftCode("AAISALTRXXX");
        swiftCode.setBankName("UNITED BANK OF ALBANIA SH.A");
        swiftCode.setAddress("HYRJA 3 RR. DRITAN HOXHA ND. 11 TIRANA");
        swiftCode.setCountryISO2("AL");
        swiftCode.setCountryName("ALBANIA");
        swiftCode.setHeadquarter(true);
    }

    // Test for SWIFT (non-headquarter) code retrieval
    @Test
    public void testGetRegularSwiftCode() throws Exception {
        SwiftCode regular = new SwiftCode();
        regular.setSwiftCode("AAISALTRAL1");
        regular.setBankName("UNITED BANK OF ALBANIA SH.A");
        regular.setAddress("SOME BRANCH ADDRESS");
        regular.setCountryISO2("AL");
        regular.setCountryName("ALBANIA");
        regular.setHeadquarter(false);

        when(swiftCodeService.getSwiftCodeByCode("AAISALTRAL1")).thenReturn(Optional.of(regular));

        mockMvc.perform(get("/v1/swift-codes/AAISALTRAL1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.swiftCode").value("AAISALTRAL1"))
                .andExpect(jsonPath("$.bankName").value("UNITED BANK OF ALBANIA SH.A"))
                .andExpect(jsonPath("$.isHeadquarter").value(false))
                .andExpect(jsonPath("$.branches").doesNotExist())
                .andExpect(jsonPath("$.message").doesNotExist());
    }

    // Test for Headquarter SWIFT code
    @Test
    public void testGetHeadquarterSwiftCode() throws Exception {
        SwiftCode hq = new SwiftCode();
        hq.setSwiftCode("AAISALTRXXX");
        hq.setBankName("UNITED BANK OF ALBANIA SH.A");
        hq.setAddress("HYRJA 3 RR. DRITAN HOXHA ND. 11 TIRANA");
        hq.setCountryISO2("AL");
        hq.setCountryName("ALBANIA");
        hq.setHeadquarter(true);

        when(swiftCodeService.getSwiftCodeByCode("AAISALTRXXX")).thenReturn(Optional.of(hq));
        when(swiftCodeService.findBranchesByBaseCode("AAISALTR", "AAISALTRXXX")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/v1/swift-codes/AAISALTRXXX"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.swiftCode").value("AAISALTRXXX"))
                .andExpect(jsonPath("$.bankName").value("UNITED BANK OF ALBANIA SH.A"))
                .andExpect(jsonPath("$.isHeadquarter").value(true))
                .andExpect(jsonPath("$.branches").exists());
    }

    // Test for invalid or non-existing SWIFT code
    @Test
    public void testGetInvalidOrNonExistingSwiftCode() throws Exception {
        // Case 1: Invalid SWIFT code (wrong length or format)
        String invalidCode = "ABCDFGH!12";

        when(swiftCodeService.getSwiftCodeByCode(invalidCode)).thenReturn(Optional.empty());

        mockMvc.perform(get("/v1/swift-codes/" + invalidCode))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());

        // Case 2: Non-existing SWIFT code (valid format but not in the system)
        String nonExistingCode = "ABCDEF12";

        when(swiftCodeService.getSwiftCodeByCode(nonExistingCode)).thenReturn(Optional.empty());

        mockMvc.perform(get("/v1/swift-codes/" + nonExistingCode))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    // Test for valid country code with non-empty list of SWIFT codes
    @Test
    public void testGetValidCountryCode() throws Exception {
        // Mock the country code validator to return true for "CL"
        when(countryCodeValidator.isValid("CL")).thenReturn(true);

        // Create a non-empty list of SWIFT codes for "CL"
        List<SwiftCode> swiftCodes = new ArrayList<>();
        SwiftCode swiftCode1 = new SwiftCode();
        swiftCode1.setSwiftCode("BCCSCLR1XXX");
        swiftCode1.setBankName("BCI CORREDOR DE BOLSA S.A.");
        swiftCode1.setAddress("Address 1");
        swiftCode1.setHeadquarter(true);
        swiftCode1.setCountryISO2("CL");
        swiftCode1.setCountryName("Chile");

        swiftCodes.add(swiftCode1);

        // Mock response for "CL" with the list of SWIFT codes
        when(swiftCodeService.getSwiftCodesByCountry("CL")).thenReturn(swiftCodes);

        // Perform the GET request for the valid country "CL"
        mockMvc.perform(get("/v1/swift-codes/country/CL"))
                .andExpect(status().isOk()) // Expecting status 200 OK
                .andExpect(jsonPath("$.countryISO2").value("CL"))
                .andExpect(jsonPath("$.countryName").exists())
                .andExpect(jsonPath("$.swiftCodes").isArray())
                .andExpect(jsonPath("$.swiftCodes").isNotEmpty());

    }

    // Test of invalid Country code
    @Test
    public void testGetInvalidCountryCode() throws Exception {
        // Case 1: Invalid country code "ABCD"
        mockMvc.perform(get("/v1/swift-codes/country/ABCD"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists()); 

        // Case 2: Country with no SWIFT codes "TN"

        when(swiftCodeService.getSwiftCodesByCountry("TN")).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/v1/swift-codes/country/TN"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists()); 
    }

    // Test for adding a new SWIFT code
    @Test
    public void testAddSwiftCode_Valid() throws Exception {
        // Create a valid SwiftCode object
        SwiftCode swiftCode = new SwiftCode();
        swiftCode.setSwiftCode("BCCSCLR1XXX");
        swiftCode.setBankName("BCI CORREDOR DE BOLSA S.A.");
        swiftCode.setAddress("Address 1");
        swiftCode.setHeadquarter(true);
        swiftCode.setCountryISO2("CL");
        swiftCode.setCountryName("Chile");

        // Mock the service methods
        when(swiftCodeService.addSwiftCode(any(SwiftCode.class))).thenReturn(swiftCode);
        when(countryCodeValidator.isValid("CL")).thenReturn(true);

        // Mock the Country object
        CountryCodeValidator.Country mockCountry = mock(CountryCodeValidator.Country.class);
        when(mockCountry.getName()).thenReturn("Chile");
        when(countryCodeValidator.getCountryByCode("CL")).thenReturn(mockCountry);

        // Perform the POST request
        mockMvc.perform(post("/v1/swift-codes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(swiftCode)))
                .andExpect(status().isCreated()) // Expecting status 201 Created
                .andExpect(jsonPath("$.swiftCode").value("BCCSCLR1XXX"))
                .andExpect(jsonPath("$.countryISO2").value("CL"))
                .andExpect(jsonPath("$.countryName").value("CHILE")); 
    }

    // Test for adding a invalid SWIFT code
    @Test
    public void testAddSwiftCode_InvalidSWIFTCode() throws Exception {
        // Create an invalid SwiftCode object
        SwiftCode swiftCode = new SwiftCode();
        swiftCode.setSwiftCode("INVALIDCODE");
        swiftCode.setBankName("Test Bank");
        swiftCode.setAddress("Test Address");
        swiftCode.setHeadquarter(true);
        swiftCode.setCountryISO2("CL");
        swiftCode.setCountryName("Chile");

        // Perform the POST request with invalid SWIFT code format
        mockMvc.perform(post("/v1/swift-codes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(swiftCode)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    // // Test for deleting a valid SWIFT code
    @Test
    public void testDeleteSwiftCode_Valid() throws Exception {
        when(swiftCodeService.existsBySwiftCode("BCCSCLR1XXX")).thenReturn(true);
        doNothing().when(swiftCodeService).deleteSwiftCode("BCCSCLR1XXX");

        // Perform the DELETE request
        mockMvc.perform(delete("/v1/swift-codes/BCCSCLR1XXX"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    // Test for deleting an invalid SWIFT code
    @Test
    public void testDeleteSwiftCode_Invalid() throws Exception {
        // Perform the DELETE request with an invalid SWIFT code
        mockMvc.perform(delete("/v1/swift-codes/INVALID"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

}

