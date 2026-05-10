import { useEffect, useState } from 'react';
import { Paper, List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import { LocationOn } from '@mui/icons-material';

interface Props {
  apiKey?: string; // We'll ignore this prop now, so your other files don't break
  inputValue: string;
  onSelect: (location: string) => void;
  isOpen: boolean;
}

export const LocationAutocompleteSuggestions = ({ inputValue, onSelect, isOpen }: Props) => {
  const [options, setOptions] = useState<any[]>([]);
  
  // REPLACE THIS WITH YOUR NEW LOCATIONIQ TOKEN
  const LOCATIONIQ_TOKEN = 'pk.e0adc6c1737e89e7bbc052c20c8c3566'; 

  useEffect(() => {
    // Add a small delay (debounce) so we don't spam the API on every keystroke
    const timeoutId = setTimeout(async () => {
      if (!inputValue.trim()) {
        setOptions([]);
        return;
      }

      try {
        // Restrict searches to the Philippines (countrycodes=ph)
        const response = await fetch(
          `https://api.locationiq.com/v1/autocomplete.php?key=${LOCATIONIQ_TOKEN}&q=${encodeURIComponent(inputValue)}&limit=5&countrycodes=ph`
        );
        
        if (response.ok) {
          const data = await response.json();
          setOptions(data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  if (!isOpen || options.length === 0) return null;

  return (
    <Paper 
      elevation={4}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 9999,
        mt: 1,
        maxHeight: 300,
        overflow: 'auto',
        borderRadius: 2
      }}
    >
      <List disablePadding>
        {options.map((option, index) => (
          <ListItem disablePadding key={index}>
            <ListItemButton 
              onMouseDown={(e) => {
                e.preventDefault(); 
                // Format the display text nicely (e.g., "Laoag, Ilocos Norte")
                const locationName = option.address?.name || option.address?.city || option.address?.town || option.display_place;
                const province = option.address?.state || option.address?.region || '';
                const fullName = province ? `${locationName}, ${province}` : locationName;
                
                onSelect(fullName);
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LocationOn sx={{ color: 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText 
                primary={option.address?.name || option.address?.city || option.address?.town || option.display_place}
                secondary={option.address?.state || option.address?.region || option.display_address}
                primaryTypographyProps={{ fontWeight: 500 }}
                secondaryTypographyProps={{ noWrap: true }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};