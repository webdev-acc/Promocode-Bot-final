// import * as React from "react";
// import {
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   Chip,
//   Box,
// } from "@mui/material";

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;

// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };

// export default function InputSelect({
//   name,
//   onChange,
//   value,
//   options,
//   label,
//   multi = false, // По умолчанию одиночный выбор
//   required = false,
//   error = false,
//   defaulValue,
//   existingTags = [], // Для множественного выбора с существующими тегами
//   helperText,
// }) {
//   const validatedValue = multi ? value || [] : value || "";

//   return (
//     <FormControl fullWidth error={error}>
//       <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
//       <Select
      
//         defaultValue={defaulValue}
//         required={required}
//         name={name}
//         labelId={`${name}-select-label`}
//         id={`${name}-select`}
//         value={validatedValue}
//         label={label}
//         onChange={onChange}
//         multiple={multi}
//         MenuProps={MenuProps}
//         renderValue={
//           multi
//             ? (selected) =>
//                 selected.length > 0 ? (
//                   <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
//                     {selected.map((val) => {
//                       const existingTag = existingTags.find(
//                         (tag) => tag.id === val
//                       );
//                       const option = options.find(
//                         (opt) => (opt.idValue || opt.value || opt) === val
//                       );
//                       const displayName =
//                         existingTag?.name ||
//                         option?.name ||
//                         option?.value ||
//                         val;

//                       return (
//                         <Chip
//                           key={val}
//                           label={displayName}
//                           onDelete={() => {
//                             const newValue = selected.filter(
//                               (item) => item !== val
//                             );
//                             onChange({ target: { name, value: newValue } });
//                           }}
//                           onMouseDown={(e) => e.stopPropagation()}
//                         />
//                       );
//                     })}
//                   </Box>
//                 ) : null
//             : undefined
//         }
//       >
//         {options?.map((el) => {
//           const optionValue = el.idValue || el.value || el;
//           const optionLabel = el.name || el.value || el;
//           return (
//             <MenuItem key={el.id ?? el} value={optionValue}>
//               {optionLabel}
//             </MenuItem>
//           );
//         })}
//       </Select>
//       {helperText && (
//         <Box component="p" sx={{ color: "error.main", mt: 1 }}>
//           {helperText}
//         </Box>
//       )}
//     </FormControl>
//   );
// }
import * as React from "react";
import { FormControl, InputLabel, Chip, Box, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

export default function InputSelect({
  name,
  onChange,
  value,
  options,
  label,
  multi = false, // По умолчанию одиночный выбор
  required = false,
  error = false,
  defaultValue,
  existingTags = [], // Для множественного выбора с существующими тегами
  helperText,
  readOnly = false,
}) {
  const validatedValue = multi
    ? value || []
    : value === undefined || value === null
    ? ""
    : value;

  // Преобразование value в объекты для Autocomplete (если multi)
  const selectedOptions = multi
    ? validatedValue.map((val) => {
        const existingTag = existingTags.find((tag) => tag.id === val);
        const option = options.find(
          (opt) => (opt.idValue || opt.value || opt) === val
        );
        return existingTag || option || { value: val, name: val };
      })
    : options.find(
        (opt) => (opt.idValue || opt.value || opt) === validatedValue
      ) || null;

  return (
    <FormControl fullWidth error={error}>
      <Autocomplete
        readOnly={readOnly}
        multiple={multi}
        id={`${name}-select`}
        options={options}
        getOptionLabel={(option) => option.name || option.value || option || ""}
        value={multi ? selectedOptions : selectedOptions}
        defaultValue={defaultValue}
        onChange={(event, newValue) => {
          const newEvent = {
            target: {
              name,
              value: multi
                ? newValue.map((item) => item.idValue || item.value || item)
                : newValue
                ? newValue.idValue || newValue.value || newValue
                : "",
            },
          };
          onChange(newEvent);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            error={error}
            helperText={helperText}
          />
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const displayName = option.name || option.value || option || "";
            return (
              <Chip
                label={displayName}
                {...getTagProps({ index })}
                onMouseDown={(e) => e.stopPropagation()}
              />
            );
          })
        }
        filterSelectedOptions // Убирает выбранные опции из списка
      />
      {helperText && !error && (
        <Box component="p" sx={{ color: "text.secondary", mt: 1 }}>
          {helperText}
        </Box>
      )}
    </FormControl>
  );
}