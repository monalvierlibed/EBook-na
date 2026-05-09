import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle, Block } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

export const RoomManagement = () => {
  const { rooms, updateRoomAvailability } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    hotelName: '',
    type: '',
    price: '',
    location: '',
    description: '',
    available: true,
  });

  const handleOpenDialog = (room?: any) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        hotelName: room.hotelName,
        type: room.type,
        price: room.price.toString(),
        location: room.location,
        description: room.description,
        available: room.available,
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        hotelName: '',
        type: '',
        price: '',
        location: '',
        description: '',
        available: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoom(null);
  };

  const handleSave = () => {
    if (editingRoom) {
      toast.success('Room updated successfully');
    } else {
      toast.success('Room added successfully');
    }
    handleCloseDialog();
  };

  const handleToggleAvailability = (roomId: string, currentStatus: boolean) => {
    updateRoomAvailability(roomId, !currentStatus);
    toast.success(`Room marked as ${!currentStatus ? 'available' : 'occupied'}`);
  };

  const handleDelete = (roomId: string) => {
    toast.success('Room deleted successfully');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Room Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your hotel rooms and availability
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Room
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell>
                <Typography fontWeight={600}>Room Name</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Hotel</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Type</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Location</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Price</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Status</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={600}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {room.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{room.hotelName}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={room.type} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {room.location}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    ${room.price}/night
                  </Typography>
                </TableCell>
                <TableCell>
                  {room.available ? (
                    <Chip
                      label="Available"
                      color="success"
                      size="small"
                      icon={<CheckCircle />}
                      onClick={() => handleToggleAvailability(room.id, room.available)}
                    />
                  ) : (
                    <Chip
                      label="Occupied"
                      color="error"
                      size="small"
                      icon={<Block />}
                      onClick={() => handleToggleAvailability(room.id, room.available)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => handleOpenDialog(room)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(room.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            {editingRoom ? 'Edit Room' : 'Add New Room'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hotel Name"
                value={formData.hotelName}
                onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Room Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Deluxe">Deluxe</MenuItem>
                  <MenuItem value="Suite">Suite</MenuItem>
                  <MenuItem value="Villa">Villa</MenuItem>
                  <MenuItem value="Executive">Executive</MenuItem>
                  <MenuItem value="Family">Family</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price per Night"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Availability Status</InputLabel>
                <Select
                  value={formData.available}
                  label="Availability Status"
                  onChange={(e) => setFormData({ ...formData, available: e.target.value as boolean })}
                >
                  <MenuItem value={true as any}>Available</MenuItem>
                  <MenuItem value={false as any}>Occupied</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingRoom ? 'Update' : 'Add'} Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
