"use client";

import { useState, useEffect } from "react";
import { SwiftCode, SwiftHeadquarter } from "@/interfaces/SwiftCode";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TablePagination from "@mui/material/TablePagination";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface TableProps {
  data: SwiftHeadquarter[];
}

export default function SwiftCodeTable({ data: initialData }: TableProps) {
  const [data, setData] = useState<SwiftHeadquarter[]>(initialData);
  const [searchType, setSearchType] = useState<"swiftCode" | "countryISO2">("swiftCode");
  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  // Validate search input based on searchType
  const validateSearchInput = (value: string, type: "swiftCode" | "countryISO2") => {
    if (!value.trim()) {
      return "Search value is required";
    }
    if (type === "countryISO2") {
      if (!/^[A-Za-z]{2}$/.test(value)) {
        return "Country code must be exactly 2 letters";
      }
    } else if (type === "swiftCode") {
      if (!/^[A-Za-z0-9]{11}$/.test(value)) {
        return "SWIFT code must be 11 alphanumeric characters";
      }
    }
    return null;
  };

  // Fetch SWIFT codes for "PL" on mount if initialData is empty
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/v1/swift-codes/country/PL`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error("Failed to fetch swift codes for PL");
        }
        const countryEntries: SwiftHeadquarter[] = result.swiftCodes.map((code: SwiftCode) => ({
          swiftCode: code.swiftCode,
          countryISO2: code.countryISO2,
          bankName: code.bankName,
          address: code.address,
          countryName: result.countryName,
          isHeadquarter: code.headquarter,
          townName: "",
        }));
        setData(countryEntries);
        setSearchType("countryISO2");
        setSearchValue("PL");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load initial data for PL");
        setData([]);
      }
    };

    if (initialData.length === 0) {
      fetchInitialData();
    }
  }, [initialData]);

  const handleSearch = async () => {
    const validationError = validateSearchInput(searchValue, searchType);
    if (validationError) {
      setSearchError(validationError);
      return;
    }

    setError(null);
    setSuccess(null);
    setSearchError(null);
    try {
      let response;
      if (searchType === "swiftCode") {
        response = await fetch(`http://localhost:8080/v1/swift-codes/${searchValue}`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch swift code");
        }
        if (result.branches) {
          const headquarterEntry: SwiftHeadquarter = {
            swiftCode: result.swiftCode,
            countryISO2: result.countryISO2,
            bankName: result.bankName,
            address: result.address,
            countryName: result.countryName,
            isHeadquarter: result.isHeadquarter,
            townName: "",
            branches: result.branches.map((branch: SwiftCode) => ({
              swiftCode: branch.swiftCode,
              countryISO2: branch.countryISO2,
              bankName: branch.bankName,
              address: branch.address,
              isHeadquarter: branch.isHeadquarter,
              townName: "",
            })),
          };
          setData([headquarterEntry]);
        } else {
          const branchEntry: SwiftHeadquarter = {
            swiftCode: result.swiftCode,
            countryISO2: result.countryISO2,
            bankName: result.bankName,
            address: result.address,
            countryName: result.countryName,
            isHeadquarter: result.isHeadquarter,
            townName: "",
          };
          setData([branchEntry]);
        }
      } else {
        response = await fetch(`http://localhost:8080/v1/swift-codes/country/${searchValue}`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch swift codes for country");
        }
        const countryEntries: SwiftHeadquarter[] = result.swiftCodes.map((code: SwiftCode) => ({
          swiftCode: code.swiftCode,
          countryISO2: code.countryISO2,
          bankName: code.bankName,
          address: code.address,
          countryName: result.countryName,
          isHeadquarter: code.headquarter,
          townName: "",
        }));
        setData(countryEntries);
      }
      setPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while searching");
      setData([]);
      setPage(0);
    }
  };

  // Handle deletion of a SWIFT code
  const handleDelete = async (swiftCode: string) => {
    try {
      const response = await fetch(`http://localhost:8080/v1/swift-codes/${swiftCode}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete SWIFT code");
      }
      setData((prevData) =>
        prevData
          .map((entry) => ({
            ...entry,
            branches: entry.branches?.filter((branch) => branch.swiftCode !== swiftCode),
          }))
          .filter((entry) => entry.swiftCode !== swiftCode)
      );
      setSuccess(result.message || "SWIFT code deleted successfully.");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while deleting");
      setSuccess(null);
    }
  };

  // Handle dialog open/close
  const handleOpenDialog = (address: string) => {
    setSelectedAddress(address);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAddress("");
  };

  // Flatten the data to include branches in the table
  const flattenedData: SwiftCode[] = data.flatMap((entry) => {
    const entries: SwiftCode[] = [entry];
    if (entry.branches) {
      entries.push(...entry.branches);
    }
    return entries;
  });

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Slice the data for the current page
  const paginatedData = flattenedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Threshold for long addresses (adjust based on testing)
  const ADDRESS_LENGTH_THRESHOLD = 50;

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 4 },
        mx: 'auto',
        mb: 4,
        boxShadow: 1,
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: { xs: '100%', sm: 'auto' },
      }}
    >
      <Typography
        variant="h6"
        fontWeight="medium"
        sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
      >
        Swift Code List
      </Typography>

      {/* Search Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
          <InputLabel>Search By</InputLabel>
          <Select
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value as "swiftCode" | "countryISO2");
              setSearchValue("");
              setSearchError(null);
            }}
            label="Search By"
          >
            <MenuItem value="swiftCode">SWIFT Code</MenuItem>
            <MenuItem value="countryISO2">Country ISO2</MenuItem>
          </Select>
        </FormControl>
        <TextField
          value={searchValue}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            setSearchValue(value);
            setSearchError(validateSearchInput(value, searchType));
          }}
          label={searchType === "swiftCode" ? "Enter SWIFT Code" : "Enter Country ISO2 (e.g., TN)"}
          variant="outlined"
          size="small"
          fullWidth
          error={!!searchError}
          helperText={searchError}
        />
        <Button
          onClick={handleSearch}
          variant="contained"
          disabled={!!searchError || !searchValue.trim()}
          sx={{
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' },
            '&.Mui-disabled': { bgcolor: '#b0bec5', cursor: 'not-allowed' },
            borderRadius: 1,
            px: { xs: 2, sm: 3 },
            py: 1,
          }}
        >
          Search
        </Button>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <Table sx={{ minWidth: { xs: 600, sm: 800 }, tableLayout: 'auto' }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: '#e8ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                borderBottom: '1px solid #d3d9de',
                position: 'sticky',
                top: 0,
                zIndex: 1,
                '& th': {
                  color: '#2d3748',
                  fontWeight: 600,
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 1, sm: 2 },
                  textAlign: 'center',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  width: {
                    xs: 'auto',
                    sm: '16.67%', // Equal width for 6 columns (100/6)
                  },
                },
                '& th:first-of-type': {
                  borderTopLeftRadius: '8px',
                },
                '& th:last-of-type': {
                  borderTopRightRadius: '8px',
                },
                '& th:nth-of-type(4)': { display: { xs: 'none', sm: 'table-cell' } }, // Address
                '& th:nth-of-type(5)': { display: { xs: 'none', sm: 'table-cell' } }, // Country Name
              }}
            >
              <TableCell>SWIFT Code</TableCell>
              <TableCell>Country ISO2</TableCell>
              <TableCell>Bank Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Country Name</TableCell>
              <TableCell>Headquarter</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flattenedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    color: 'text.secondary',
                    py: 1,
                    px: 2,
                    textAlign: 'center',
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }}
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((entry, index) => (
                <TableRow
                  key={`${entry.swiftCode}-${index}`}
                  sx={{
                    bgcolor: entry.isHeadquarter ? '#e8eaf6' : 'white',
                    '&:hover': { bgcolor: entry.isHeadquarter ? '#d1d9ff' : '#f5f5f5' },
                  }}
                >
                  <TableCell
                    sx={{
                      fontFamily: 'monospace',
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 1, sm: 2 },
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DeleteIcon
                        sx={{
                          color: '#d32f2f',
                          fontSize: { xs: 20, sm: 24 },
                          cursor: 'pointer',
                          '&:hover': { color: '#b71c1c' },
                          mr: 1,
                        }}
                        onClick={() => handleDelete(entry.swiftCode)}
                      />
                      {entry.swiftCode}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 1, sm: 2 },
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    {entry.countryISO2}
                  </TableCell>
                  <TableCell
                    sx={{
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 1, sm: 2 },
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    {entry.bankName}
                  </TableCell>
                  <TableCell
                    sx={{
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 1, sm: 2 },
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      display: { xs: 'none', sm: 'table-cell' },
                      maxWidth: 200, // Constrain width to ensure truncation
                    }}
                  >
                    <Box
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        lineHeight: 1.5,
                      }}
                    >
                      {entry.address}
                      {entry.address.length > ADDRESS_LENGTH_THRESHOLD && (
                        <Box
                          component="span"
                          sx={{
                            color: '#1976d2',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            ml: 0.5,
                            '&:hover': { color: '#1565c0' },
                          }}
                          onClick={() => handleOpenDialog(entry.address)}
                        >
                          ...
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 1, sm: 2 },
                      textAlign: 'center',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      display: { xs: 'none', sm: 'table-cell' },
                    }}
                  >
                    {entry.countryName || "-"}
                  </TableCell>
                  <TableCell
                    sx={{
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 1, sm: 2 },
                      textAlign: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      {entry.isHeadquarter ? (
                        <CheckCircleIcon sx={{ color: 'green', fontSize: { xs: 20, sm: 25 } }} />
                      ) : (
                        <CancelIcon sx={{ color: 'red', fontSize: { xs: 20, sm: 25 } }} />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Dialog for Full Address */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Full Address</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, whiteSpace: 'pre-wrap' }}>
            {selectedAddress}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={flattenedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Rows per page:"
          sx={{
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              color: 'text.primary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
            '& .MuiTablePagination-actions button': {
              color: 'text.primary',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        />
      </Box>
    </Paper>
  );
}