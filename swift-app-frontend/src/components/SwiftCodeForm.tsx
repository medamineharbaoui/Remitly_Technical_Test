"use client";

import { useState, useRef } from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/system";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Alert from "@mui/material/Alert";
import { SelectChangeEvent } from "@mui/material/Select";
import countries from "@/../public/data/countries-iso-2-codes.json";

// Define SwiftCode interface with headquarter
interface SwiftCode {
  swiftCode: string;
  bankName: string;
  address: string;
  townName: string;
  headquarter: boolean;
  countryISO2: string;
  countryName: string;
}

const CustomCheckbox = styled(Checkbox)({
  "&.Mui-checked": {
    color: "#1976d2",
  },
});

export default function Form() {
  const [form, setForm] = useState<SwiftCode>({
    swiftCode: "",
    bankName: "",
    address: "",
    townName: "",
    headquarter: false,
    countryISO2: "",
    countryName: "",
  });

  const [swiftCodeError, setSwiftCodeError] = useState<string | null>(null);
  const [bankNameError, setBankNameError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [countryISO2Error, setCountryISO2Error] = useState<string | null>(null);
  const [countryNameError, setCountryNameError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation functions
  const validateSwiftCode = (value: string) => {
    const isValidLength = value.length === 11;
    const isAlphanumeric = /^[A-Za-z0-9]+$/.test(value);
    if (!value) {
      return "SWIFT Code is required";
    }
    if (!isValidLength) {
      return "SWIFT Code must be 11 characters long";
    }
    if (!isAlphanumeric) {
      return "SWIFT Code must contain only letters and numbers";
    }
    return null;
  };

  const validateBankName = (value: string) => {
    if (!value.trim()) {
      return "Bank Name is required";
    }
    return null;
  };

  const validateAddress = (value: string) => {
    if (!value.trim()) {
      return "Address is required";
    }
    return null;
  };

  const validateCountryISO2 = (value: string) => {
    if (!value) {
      return "Country ISO2 is required";
    }
    const isValid = countries.some((country) => country.Code === value);
    if (!isValid) {
      return "Invalid Country ISO2 code";
    }
    return null;
  };

  const validateCountryName = (value: string) => {
    if (!value) {
      return "Country Name is required";
    }
    const isValid = countries.some((country) => country.Name === value);
    if (!isValid) {
      return "Invalid Country Name";
    }
    return null;
  };

  // Check if the form is valid
  const isFormValid = () => {
    return (
      !validateSwiftCode(form.swiftCode) &&
      !validateBankName(form.bankName) &&
      !validateAddress(form.address) &&
      !validateCountryISO2(form.countryISO2) &&
      !validateCountryName(form.countryName)
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    if ("type" in e.target) {
      const { name, value } = e.target;

      if (name === "swiftCode") {
        const error = validateSwiftCode(value);
        setSwiftCodeError(error);
        const endsWithXXX = value.toUpperCase().endsWith("XXX");
        setForm((prev) => ({
          ...prev,
          swiftCode: value,
          headquarter: endsWithXXX,
        }));
      } else if (name === "bankName") {
        setBankNameError(validateBankName(value));
        setForm((prev) => ({
          ...prev,
          bankName: value,
        }));
      } else if (name === "address") {
        setAddressError(validateAddress(value));
        setForm((prev) => ({
          ...prev,
          address: value,
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          [name as string]: value,
        }));
      }
    } else {
      const { name, value } = e.target;

      if (name === "countryISO2") {
        const selectedCountry = countries.find((country) => country.Code === value);
        setCountryISO2Error(validateCountryISO2(value));
        setCountryNameError(null);
        setForm((prev) => ({
          ...prev,
          countryISO2: value as string,
          countryName: selectedCountry ? selectedCountry.Name : "",
        }));
      } else if (name === "countryName") {
        const selectedCountry = countries.find((country) => country.Name === value);
        setCountryNameError(validateCountryName(value));
        setCountryISO2Error(null);
        setForm((prev) => ({
          ...prev,
          countryName: value as string,
          countryISO2: selectedCountry ? selectedCountry.Code : "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const swiftError = validateSwiftCode(form.swiftCode);
    const bankError = validateBankName(form.bankName);
    const addrError = validateAddress(form.address);
    const iso2Error = validateCountryISO2(form.countryISO2);
    const nameError = validateCountryName(form.countryName);

    setSwiftCodeError(swiftError);
    setBankNameError(bankError);
    setAddressError(addrError);
    setCountryISO2Error(iso2Error);
    setCountryNameError(nameError);

    if (swiftError || bankError || addrError || iso2Error || nameError) {
      return;
    }

    // Normalize swiftCode to uppercase to match backend expectation
    const payload = {
      ...form,
      swiftCode: form.swiftCode.toUpperCase(),
    };

    console.log("Payload sent to backend:", payload);

    try {
      setError(null);
      const response = await fetch("http://localhost:8080/v1/swift-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("Content-Type") || "";
      let result;
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = { message: await response.text() };
      }

      if (!response.ok) {
        console.log("Backend error response:", result);
        throw new Error(result.message || `HTTP error: ${response.status}`);
      }

      setForm({
        swiftCode: "",
        bankName: "",
        address: "",
        townName: "",
        headquarter: false,
        countryISO2: "",
        countryName: "",
      });
      setSwiftCodeError(null);
      setBankNameError(null);
      setAddressError(null);
      setCountryISO2Error(null);
      setCountryNameError(null);
      setSuccess(result.message || "SWIFT code added successfully.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while adding SWIFT code");
      setSuccess(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8080/v1/swift-codes/import", {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("Content-Type") || "";
      let result;
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = { message: await response.text() };
      }

      if (!response.ok) {
        throw new Error(result.message || `HTTP error: ${response.status}`);
      }

      setSuccess(result.message || "SWIFT codes imported from CSV.");
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while importing CSV");
      setSuccess(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 4,
        maxWidth: "64rem",
        mx: "auto",
        mb: 4,
        boxShadow: 1,
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h6" fontWeight="medium">
        Add Swift Code
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          {error}
        </Alert>
      )}

      {/* First row with 3 inputs */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <TextField
          name="swiftCode"
          value={form.swiftCode}
          onChange={handleChange}
          label="SWIFT Code"
          variant="outlined"
          size="small"
          required
          fullWidth
          error={!!swiftCodeError}
          helperText={swiftCodeError}
        />
        <TextField
          name="bankName"
          value={form.bankName}
          onChange={handleChange}
          label="Bank Name"
          variant="outlined"
          size="small"
          required
          fullWidth
          error={!!bankNameError}
          helperText={bankNameError}
        />
        <TextField
          name="address"
          value={form.address}
          onChange={handleChange}
          label="Address"
          variant="outlined"
          size="small"
          required
          fullWidth
          error={!!addressError}
          helperText={addressError}
        />
      </Box>

      {/* Second row with 3 inputs */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <TextField
          name="townName"
          value={form.townName}
          onChange={handleChange}
          label="Town (Optional)"
          variant="outlined"
          size="small"
          fullWidth
        />
        <FormControl fullWidth size="small" error={!!countryISO2Error}>
          <InputLabel>Country ISO2 (e.g., TN)</InputLabel>
          <Select
            name="countryISO2"
            value={form.countryISO2}
            onChange={handleChange}
            label="Country ISO2 (e.g., TN)"
            required
          >
            <MenuItem value="">
              <em>Select Country ISO2</em>
            </MenuItem>
            {countries.map((country) => (
              <MenuItem key={country.Code} value={country.Code}>
                {country.Code}
              </MenuItem>
            ))}
          </Select>
          {countryISO2Error && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              {countryISO2Error}
            </Typography>
          )}
        </FormControl>
        <FormControl fullWidth size="small" error={!!countryNameError}>
          <InputLabel>Country Name</InputLabel>
          <Select
            name="countryName"
            value={form.countryName}
            onChange={handleChange}
            label="Country Name"
            required
          >
            <MenuItem value="">
              <em>Select Country Name</em>
            </MenuItem>
            {countries.map((country) => (
              <MenuItem key={country.Name} value={country.Name}>
                {country.Name}
              </MenuItem>
            ))}
          </Select>
          {countryNameError && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              {countryNameError}
            </Typography>
          )}
        </FormControl>
      </Box>

      {/* Checkbox, Submit Button, and Upload Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mt: 3,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <FormControlLabel
          control={
            <CustomCheckbox
              name="headquarter"
              checked={form.headquarter}
              disabled
            />
          }
          label="Is Headquarter"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!isFormValid()}
          sx={{
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#1565c0" },
            "&.Mui-disabled": { bgcolor: "#b0bec5", cursor: "not-allowed" },
            borderRadius: 1,
            px: 3,
          }}
        >
          Add Swift Code
        </Button>
        <Button
          variant="outlined"
          onClick={handleUploadClick}
          sx={{
            borderColor: "#1976d2",
            color: "#1976d2",
            "&:hover": { borderColor: "#1565c0", color: "#1565c0" },
            borderRadius: 1,
            px: 3,
          }}
        >
          Upload CSV
        </Button>
        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </Box>
    </Paper>
  );
}