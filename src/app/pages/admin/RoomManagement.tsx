import { ChangeEvent, useEffect, useState } from 'react';
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
  Stack,
  Card,
  CardMedia,
  CardActions,
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle, Block, Upload, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { RoomWithHotel } from '../../../lib/supabase';
import { toast } from 'sonner';

export const RoomManagement = () => {
  const {
    rooms,
    hotels,
    fetchHotels,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomAvailability,
    updateRoomImages,
    uploadRoomImages,
  } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomWithHotel | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    hotel_id: '',
    room_type: '',
    price_per_night: '',
    capacity: '2',
    description: '',
    available: true,
    amenities: '',
    images: [] as string[],
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleOpenDialog = (room?: RoomWithHotel) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        name: room.name,
        hotel_id: room.hotel_id,
        room_type: room.room_type,
        price_per_night: room.price_per_night.toString(),
        capacity: room.capacity.toString(),
        description: room.description || '',
        available: room.available,
        amenities: (room.amenities || []).join(', '),
        images: room.images || [],
      });
    } else {
      setEditingRoom(null);
      setFormData({
        name: '',
        hotel_id: '',
        room_type: '',
        price_per_night: '',
        capacity: '2',
        description: '',
        available: true,
        amenities: '',
        images: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoom(null);
  };

  const handleSave = async () => {
    if (!formData.hotel_id) {
      toast.error('Please select a hotel');
      return;
    }
    setSaving(true);
    const roomPayload = {
      hotel_id: formData.hotel_id,
      name: formData.name.trim(),
      room_type: formData.room_type,
      description: formData.description.trim() || null,
      price_per_night: Number(formData.price_per_night),
      capacity: Number(formData.capacity),
      amenities: formData.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      images: formData.images,
      available: formData.available,
    };

    const { error } = editingRoom
      ? await updateRoom(editingRoom.id, roomPayload)
      : await createRoom(roomPayload);

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    if (editingRoom) {
      toast.success('Room updated successfully');
    } else {
      toast.success('Room added successfully');
    }
    setSaving(false);
    handleCloseDialog();
  };

  const handleToggleAvailability = async (roomId: string, currentStatus: boolean) => {
    const { error } = await updateRoomAvailability(roomId, !currentStatus);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Room marked as ${!currentStatus ? 'available' : 'occupied'}`);
  };

  const handleDelete = async (roomId: string) => {
    const { error } = await deleteRoom(roomId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Room deleted successfully');
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const { urls, error } = await uploadRoomImages(Array.from(files));
    if (error) {
      toast.error(error.message);
      return;
    }

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    toast.success(`${urls.length} image(s) uploaded`);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const next = [...prev.images];
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return { ...prev, images: next };
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const persistImagesOnly = async () => {
    if (!editingRoom) return;
    const { error } = await updateRoomImages(editingRoom.id, formData.images);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Room images updated');
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
                  <Typography variant="body2">{room.hotel?.name || 'N/A'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={room.room_type} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    ₱{Number(room.price_per_night).toLocaleString()}/night
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
              <FormControl fullWidth>
                <InputLabel>Hotel</InputLabel>
                <Select
                  value={formData.hotel_id}
                  label="Hotel"
                  onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                >
                  {hotels.map((hotel) => (
                    <MenuItem key={hotel.id} value={hotel.id}>
                      {hotel.name} ({hotel.city}, {hotel.province})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={formData.room_type}
                  label="Room Type"
                  onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
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
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amenities (comma-separated)"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="WiFi, Pool, Air Conditioning"
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
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Button variant="outlined" component="label" startIcon={<Upload />}>
                  Upload Images
                  <input hidden accept="image/*" multiple type="file" onChange={handleImageUpload} />
                </Button>
                {editingRoom && (
                  <Button variant="outlined" onClick={persistImagesOnly}>
                    Save Images
                  </Button>
                )}
              </Stack>
              <Grid container spacing={1}>
                {formData.images.map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`${image.slice(0, 20)}-${index}`}>
                    <Card>
                      <CardMedia component="img" height="120" image={image} />
                      <CardActions sx={{ justifyContent: 'space-between' }}>
                        <Box>
                          <IconButton size="small" onClick={() => moveImage(index, 'up')}>
                            <ArrowUpward fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => moveImage(index, 'down')}>
                            <ArrowDownward fontSize="small" />
                          </IconButton>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => removeImage(index)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {editingRoom ? 'Update' : 'Add'} Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
