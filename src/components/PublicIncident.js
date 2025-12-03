import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  PhotoCamera,
  LocationOn,
  Send,
  Close,
  Cancel,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';

const PublicIncident = () => {
  function LocationMarker({ position, setPosition, setSelectedLocation, onLocationSelect }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setSelectedLocation({ lat, lng });
        onLocationSelect(lat, lng);
      },
    });

    return position === null ? null : (
      <Marker position={position}></Marker>
    );
  }
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [message, setMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapPosition, setMapPosition] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const incidentTypes = [
    'Sewage Leak',
    'Road Damage',
    'Water Main Break',
    'Storm Drain Issue',
    'Manhole Problem',
    'Other'
  ];

  const validationSchema = Yup.object({
    title: Yup.string().required('Incident type is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters')
      .required('Description is required'),
    location: Yup.string().required('Location is required'),
    contactName: Yup.string().required('Contact name is required'),
    contactPhone: Yup.string().matches(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
    contactEmail: Yup.string().email('Invalid email address'),
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setUploadedFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  });

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('location', values.location);
      formData.append('contactName', values.contactName);
      formData.append('contactPhone', values.contactPhone || '');
      formData.append('contactEmail', values.contactEmail || '');

      if (selectedLocation) {
        formData.append('latitude', selectedLocation.lat);
        formData.append('longitude', selectedLocation.lng);
      }

      uploadedFiles.forEach((fileObj, index) => {
        formData.append(`images`, fileObj.file);
      });

      const response = await api.post('/public/report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTrackingId(response.data.trackingId);
      setSubmitted(true);
      setMessage('Incident reported successfully!');
      resetForm();
      setUploadedFiles([]);
      setSelectedLocation(null);
    } catch (error) {
      setMessage('Error reporting incident. Please try again.');
    }
  };

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Incident Reported Successfully!
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Your Tracking ID: <strong>{trackingId}</strong>
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please save this tracking ID to check the progress of your incident report.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSubmitted(false);
                setTrackingId('');
                setMessage('');
              }}
            >
              Report Another Incident
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: '95%' }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
        Report a Sewage Incident
      </Typography>
      <Typography variant="body1" align="center" sx={{ mb: 4 }}>
        Help us maintain our city's infrastructure by reporting sewage-related issues.
      </Typography>

      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Formik
          initialValues={{
            title: '',
            description: '',
            location: '',
            contactName: '',
            contactPhone: '',
            contactEmail: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, handleChange, setFieldValue }) => {
            const handleLocationSelect = (lat, lng) => {
              setFieldValue('location', `${lat.toFixed(6)},${lng.toFixed(6)}`);
            };

            return (
              <Form>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Incident Details Section */}
                <Box>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                    Incident Details
                  </Typography>
                </Box>

                <Box>
                  <FormControl fullWidth error={touched.title && !!errors.title}>
                    <InputLabel>Incident Type</InputLabel>
                    <Select
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      label="Incident Type"
                    >
                      {incidentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.title && errors.title && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.title}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Box>
                  <Field
                    as={TextField}
                    name="description"
                    label="Description *"
                    multiline
                    rows={6}
                    fullWidth
                    error={touched.description && !!errors.description}
                    helperText={`${values.description.length}/500 characters`}
                    placeholder="Describe the sewage incident in detail..."
                  />
                </Box>

                {/* Location Section */}
                <Box>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Location Information
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Field
                            as={TextField}
                            name="location"
                            label="Location *"
                            fullWidth
                            error={touched.location && !!errors.location}
                            helperText={touched.location && errors.location}
                            placeholder="Street address or landmark, or click on map"
                          />
                        </Box>

                        <Box sx={{ height: 300, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                          <MapContainer
                            center={[-26.2041, 28.0473]}
                            zoom={10}
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationMarker
                              position={mapPosition}
                              setPosition={setMapPosition}
                              setSelectedLocation={setSelectedLocation}
                              onLocationSelect={handleLocationSelect}
                            />
                          </MapContainer>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

               {/* Contact Information Section */}
               <Box>
                 <Card sx={{ mb: 2 }}>
                   <CardContent>
                     <Typography variant="h6" gutterBottom color="primary">
                       Contact Information
                     </Typography>

                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                       <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
                         <Box sx={{ flex: '1 1 45%' }}>
                           <Field
                             as={TextField}
                             name="contactName"
                             label="Full Name *"
                             fullWidth
                             error={touched.contactName && !!errors.contactName}
                             helperText={touched.contactName && errors.contactName}
                           />
                         </Box>

                         <Box sx={{ flex: '1 1 45%' }}>
                           <Field
                             as={TextField}
                             name="contactPhone"
                             label="Phone Number"
                             fullWidth
                             error={touched.contactPhone && !!errors.contactPhone}
                             helperText={touched.contactPhone && errors.contactPhone}
                           />
                         </Box>
                       </Box>

                       <Box>
                         <Field
                           as={TextField}
                           name="contactEmail"
                           label="Email Address"
                           type="email"
                           fullWidth
                           error={touched.contactEmail && !!errors.contactEmail}
                           helperText={touched.contactEmail && errors.contactEmail}
                         />
                       </Box>
                     </Box>
                   </CardContent>
                 </Card>
               </Box>

               {/* Attachments Section */}
               <Box>
                 <Card sx={{ mb: 2 }}>
                   <CardContent>
                     <Typography variant="h6" gutterBottom color="primary">
                       Attachments
                     </Typography>
                     <Typography variant="body2" color="text.secondary" gutterBottom>
                       Upload Photos (Optional)
                     </Typography>
                     <Box
                       {...getRootProps()}
                       sx={{
                         border: '2px dashed #ccc',
                         borderRadius: 2,
                         p: 3,
                         textAlign: 'center',
                         cursor: 'pointer',
                         '&:hover': { borderColor: 'primary.main' }
                       }}
                     >
                       <input {...getInputProps()} />
                       <PhotoCamera sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                       <Typography>
                         Drag & drop images here, or click to select files
                       </Typography>
                       <Typography variant="body2" color="text.secondary">
                         Maximum 5 images, up to 10MB each
                       </Typography>
                     </Box>

                     {uploadedFiles.length > 0 && (
                       <Box sx={{ mt: 2 }}>
                         <Typography variant="subtitle2" gutterBottom>
                           Selected Files:
                         </Typography>
                         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                           {uploadedFiles.map((fileObj, index) => (
                             <Chip
                               key={index}
                               label={fileObj.file.name}
                               onDelete={() => removeFile(index)}
                               size="small"
                             />
                           ))}
                         </Box>
                       </Box>
                     )}
                   </CardContent>
                 </Card>
               </Box>

               {/* Buttons */}
               <Box>
                 <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                   <Button
                     variant="outlined"
                     size="large"
                     fullWidth
                     startIcon={<Cancel />}
                     onClick={() => navigate('/')}
                     color="secondary"
                   >
                     Cancel
                   </Button>
                   <Button
                     type="submit"
                     variant="contained"
                     size="large"
                     fullWidth
                     startIcon={<Send />}
                   >
                     Submit Incident Report
                   </Button>
                 </Box>
               </Box>
              </Box>
            </Form>
            );
          }}
        </Formik>
      </Paper>
    </Container>
  );
};

export default PublicIncident;