"use client";

import { useState, useEffect, useCallback } from "react";
import Form from "../../components/SwiftCodeForm";
import Table from "../../components/SwiftCodeTable";
import { SwiftCode, SwiftHeadquarter } from "@/interfaces/SwiftCode";
import { Alert } from "@mui/material";

export default function DashboardPage() {
  const [entries, setEntries] = useState<SwiftHeadquarter[]>([]);
  const [error, setError] = useState<string | null>(null);
 

  // Memoized fetchData function to avoid redefinition
  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("http://localhost:8080/v1/swift-codes/country/PL", {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.statusText}`);
      }
      const data = await res.json();
      // Ensure data is in the correct format
      const formattedData: SwiftHeadquarter[] = data.swiftCodes
        ? data.swiftCodes.map((code: SwiftCode) => ({
            swiftCode: code.swiftCode,
            countryISO2: code.countryISO2,
            bankName: code.bankName,
            address: code.address,
            countryName: data.countryName ,
            isHeadquarter:  code.isHeadquarter,
            townName: code.townName || "",
          }))
        : [];
      setEntries(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching data");
      setEntries([]);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className="p-8">
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      <Form />
      <Table data={entries} />
    </main>
  );
}