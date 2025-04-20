/* eslint-disable react/prop-types */
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear'; // Import ClearIcon

function SearchBar({ searchQuery, handleSearchChange, onClearSearch, label }) {
  return (
    <TextField
      label={label || "Search Posts"}
      variant="outlined"
      fullWidth
      value={searchQuery}
      onChange={handleSearchChange}
      autoComplete="off"        
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {searchQuery ? (
              <ClearIcon 
                sx={{ color: 'white', cursor: 'pointer' }} 
                onClick={onClearSearch}
              />
            ) : (
              <SearchIcon sx={{ color: 'white' }} />
            )}
          </InputAdornment>
        ),
        sx: {
          color: 'white',
        },
      }}
      sx={{
        maxWidth: '600px',
        '& .MuiInputLabel-root': {
          color: 'white',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'white',
          },
          '&:hover fieldset': {
            borderColor: 'white',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'white',
          },
        },
        '& .MuiFormLabel-colorPrimary': {
          color: 'white !important',
        },
      }}
      className="rounded-lg"
    />
  );
}

export default SearchBar;
