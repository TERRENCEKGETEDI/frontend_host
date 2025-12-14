import React, { useState, useEffect } from 'react';
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
  CircularProgress,
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
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
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
  const [model, setModel] = useState(null);
  const [classifications, setClassifications] = useState({});
  const [classifying, setClassifying] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [manualOverrides, setManualOverrides] = useState({});
  const [imageValidationMessage, setImageValidationMessage] = useState('');

  // Comprehensive relevant keywords for sewage/water issues
  const relevantClasses = [
    // 💧 Water (clean or dirty)
    "water", "flood", "puddle", "pool", "stream", "river", "canal", "ditch", "drain", "drainage",
    "gutter", "sewer", "sewage", "wastewater", "runoff", "overflow",

    // 🚧 Roads & roadside context (VERY important)
    "road", "street", "highway", "sidewalk", "pavement", "curb", "kerb", "alley", "bridge",
    "underpass", "intersection",

    // 🧱 Infrastructure & pipes
    "pipe", "pipeline", "conduit", "culvert", "manhole", "hydrant", "valve", "septic",
    "drainpipe", "storm drain",

    // 🏗️ Construction & damage indicators
    "construction", "construction site", "excavation", "trench", "repair", "maintenance",
    "leak", "burst", "crack", "hole", "collapse", "erosion",

    // 🌍 Ground / terrain (this catches MOST real images)
    "mud", "soil", "earth", "dirt", "sand", "gravel", "ground", "bank", "slope",

    // 🗑️ Pollution & waste (critical for your use case)
    "trash", "garbage", "litter", "waste", "plastic", "plastics", "bottle", "bag", "debris",
    "rubbish", "dump", "pollution", "contamination",

    // 🏭 Urban / industrial environment
    "urban", "industrial", "factory", "warehouse", "parking lot", "lot", "yard", "facility",

    // 🌧️ Weather / water conditions
    "rain", "rainwater", "storm", "floodplain", "wet", "standing water",

    // 🌊 Natural water bodies & landforms
    "sea", "ocean", "shore", "seashore", "coast", "coastline", "beach", "sandbar", "sand bar",
    "bay", "lagoon", "harbor", "harbour", "estuary", "delta",

    // 🏞️ Natural terrain related to water flow
    "valley", "vale", "ravine", "gully", "channel", "basin", "wetland", "marsh", "swamp",
    "floodplain",

    // 🛶 Water-related structures
    "boathouse", "pier", "dock", "jetty", "wharf", "embankment", "dam", "weir",

    // Additional pipes & flow systems (no duplicates)
    "pipes", "duct", "waste pipe", "wastewater pipe", "sewer pipe", "storm pipe",
    "water pipe", "water main", "mainline", "service line", "utility line",
    "overflow pipe", "outfall",

    // Additional manholes & access points
    "manhole cover", "inspection cover", "inspection chamber", "access cover",
    "access chamber", "utility cover", "sewer cover", "storm cover", "grate",
    "grating", "grid", "catch basin", "gully trap", "storm inlet", "drain inlet",
    "inspection pit",

    // Additional sewage leak / sanitation issues
    "sewerage", "effluent", "raw sewage", "backflow", "leakage", "spill",
    "spillage", "foul water", "sanitary",

    // Additional road damage & surface failure
    "tar", "asphalt", "concrete", "road damage", "road collapse", "subsidence",
    "pothole", "sinkhole", "washout", "fracture", "break", "cave-in",

    // Additional water main break / pressure failure
    "main break", "pipe burst", "rupture", "ruptured pipe", "pressure leak",
    "high pressure", "water loss", "flowing water", "spray", "jet", "fountain",

    // Additional storm drain issues
    "stormwater", "stormwater drain", "drain channel", "blocked drain",
    "clogged drain", "overflowing drain", "flooded drain", "catchment",

    // Additional manhole problems
    "open manhole", "missing cover", "broken cover", "sunken manhole",
    "raised manhole", "blocked manhole", "overflowing manhole", "sewer overflow",
    "manhole leak",

    // Additional general "other"
    "utility work", "infrastructure", "public works", "municipal",

    // Additional water & liquid states
    "waters", "liquid", "fluid", "moist", "overflown", "pond", "lake", "reservoir",
    "creek", "brook", "rainfall", "splash", "drip", "dripping", "seep", "seepage", "trickle",

    // Additional sewage, wastewater & contamination
    "blackwater", "greywater", "toxic", "filthy", "dirty water", "waste liquid",

    // Additional pipes, mains, underground utilities
    "piping", "gate valve", "pressure valve", "junction", "connector", "coupling",
    "flange", "elbow", "joint", "cracked pipe", "leaking pipe", "exposed pipe", "underground pipe",

    // Additional manholes, drains & access structures
    "drains", "inlet", "outlet", "trench",

    // Additional roads, streets & surfaces
    "roads", "lane", "footpath", "shoulder", "median", "traffic island", "driveway",
    "industrial road", "residential street",

    // Additional road damage & failure
    "surface damage", "split", "undermined", "broken road", "damaged pavement",
    "uplift", "deformation",

    // Additional storm, weather & natural water events
    "stormy", "rainstorm", "thunderstorm", "heavy rain", "downpour", "flash flood",
    "waterlogged", "sludge", "silt", "sediment",

    // Additional pollution, plastics & solid waste
    "plastic bag", "plastic bottle", "container", "scrap", "refuse", "floating waste",
    "water pollution", "contaminated water", "illegal dumping", "waste pile", "landfill", "dump site",

    // Additional water-related structures
    "levee", "retaining wall", "water treatment", "wastewater treatment",
    "pump station", "lift station", "reservoir wall",

    // Additional construction, repair & municipal context
    "civil works", "roadworks", "maintenance crew", "temporary repair", "emergency repair"
  ];

  // Load MobileNet model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading MobileNet model:', error);
      }
    };
    loadModel();
  }, []);

  // Classify images when model is loaded and files are uploaded
  useEffect(() => {
    const classifyUploadedImages = async () => {
      if (!model || uploadedFiles.length === 0) return;

      setClassifying(true);
      const newClassifications = { ...classifications };

      for (const fileObj of uploadedFiles) {
        if (newClassifications[fileObj.file.name]) continue; // Already classified

        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = fileObj.preview;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const classification = await classifyImage(img, fileObj.file.name);
          newClassifications[fileObj.file.name] = classification;
        } catch (error) {
          console.error('Error classifying image:', error);
          newClassifications[fileObj.file.name] = null; // Mark as failed
        }
      }

      setClassifications(newClassifications);
      setClassifying(false);
    };

    classifyUploadedImages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, uploadedFiles]);

  // Normalize labels by splitting on commas
  const normalizeLabels = (label) => {
    return label
      .toLowerCase()
      .split(",")
      .map(l => l.trim());
  };

  // Check if predictions are relevant
  const isRelevant = (predictions) => {
    let relevantCount = 0;

    for (const p of predictions) {
      if (p.probability >= 0.20) {
        const labels = normalizeLabels(p.className);
        if (labels.some(label => relevantClasses.some(k => label.includes(k)))) {
          relevantCount++;
        }
      }
    }

    // Accept if any single prediction is highly relevant (>= 0.40) OR if at least 2 predictions are relevant
    const hasHighConfidence = predictions.some(p =>
      p.probability >= 0.40 &&
      normalizeLabels(p.className).some(label =>
        relevantClasses.some(k => label.includes(k))
      )
    );

    return hasHighConfidence || relevantCount >= 2;
  };

  // Classify image
  const classifyImage = async (imageElement, fileName) => {
    if (!model) return null;
    try {
      const predictions = await model.classify(imageElement);
      const relevant = isRelevant(predictions);
      const topPrediction = predictions[0];
      return {
        predictions,
        className: topPrediction.className,
        probability: topPrediction.probability,
        isRelevant: relevant
      };
    } catch (error) {
      console.error('Error classifying image:', error);
      return null;
    }
  };

  // Check if classification is relevant to incident
  const isRelevantToIncident = (classification, incidentType, description) => {
    if (!classification) return true; // If classification failed, allow

    // Check if any word in description matches relevant classes
    const descriptionWords = description.toLowerCase().split(/\s+/);
    const hasRelevantWordInDescription = descriptionWords.some(word =>
      relevantClasses.some(cls => word.includes(cls) || cls.includes(word))
    );

    if (hasRelevantWordInDescription) return true;

    // Original logic: check classification against incident type/description
    const keywords = [incidentType.toLowerCase(), ...descriptionWords];
    return relevantClasses.some(cls =>
      classification.className.toLowerCase().includes(cls) ||
      keywords.some(keyword => classification.className.toLowerCase().includes(keyword))
    );
  };

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
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setClassifications(prev => {
      const newClass = { ...prev };
      delete newClass[fileToRemove.file.name];
      return newClass;
    });
    setManualOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[fileToRemove.file.name];
      return newOverrides;
    });
  };

  const handleSubmit = async (values, { resetForm }) => {
    // Check image classifications
    if (uploadedFiles.length > 0) {
      for (const fileObj of uploadedFiles) {
        const classification = classifications[fileObj.file.name];
        const isOverridden = manualOverrides[fileObj.file.name];

        if (classification && !classification.isRelevant && !isOverridden) {
          setImageValidationMessage('One or more uploaded images do not appear to be related to sewage or water issues. You can accept them manually if they are relevant.');
          return;
        }
        if (!isRelevantToIncident(classification, values.title, values.description) && !isOverridden) {
          setImageValidationMessage('One or more uploaded images do not appear to be relevant to the reported incident. You can accept them manually if they are relevant.');
          return;
        }
      }
    }

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
      setClassifications({});
      setManualOverrides({});
      setImageValidationMessage('');
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

      {alertMessage && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setAlertMessage('')}>
          {alertMessage}
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
          {({ errors, touched, values, handleChange, setFieldValue, validateForm }) => {
            const handleLocationSelect = (lat, lng) => {
              setFieldValue('location', `${lat.toFixed(6)},${lng.toFixed(6)}`);
            };

            const handleFormSubmit = async (e) => {
              e.preventDefault();
              const formErrors = await validateForm();
              const errorFields = Object.keys(formErrors);
              if (errorFields.length > 0) {
                // Set alert message for missing fields
                const fieldNames = {
                  title: 'Incident Type',
                  description: 'Description',
                  location: 'Location',
                  contactName: 'Full Name',
                  contactPhone: 'Phone Number',
                  contactEmail: 'Email Address'
                };
                const missingFields = errorFields.map(field => fieldNames[field] || field).join(', ');
                setMessage(`Please fill in the following required fields: ${missingFields}`);

                // Scroll to first error field
                const firstErrorField = errorFields[0];
                const element = document.getElementById(firstErrorField);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  element.focus();
                }
                return;
              }
              // If no errors, proceed with normal submit
              handleSubmit(values, { resetForm: () => {}, errors: {}, touched: {} });
            };

            return (
              <Form onSubmit={handleFormSubmit}>
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
                      id="title"
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
                    id="description"
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
                            id="location"
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
                             id="contactName"
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
                             id="contactPhone"
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
                           id="contactEmail"
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
                         border: classifying ? '2px solid #1976d2' : '2px dashed #ccc',
                         borderRadius: 2,
                         p: 3,
                         textAlign: 'center',
                         cursor: 'pointer',
                         animation: classifying ? 'pulse 1.5s infinite' : 'none',
                         '@keyframes pulse': {
                           '0%': { borderColor: '#1976d2', boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)' },
                           '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
                           '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' }
                         },
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
                           {uploadedFiles.map((fileObj, index) => {
                             const classification = classifications[fileObj.file.name];
                             let chipColor = 'default';
                             let chipLabel = fileObj.file.name;
                             if (classification) {
                               chipLabel += ` (${classification.className})`;
                               chipColor = classification.isRelevant ? 'success' : 'error';
                             } else if (classifying) {
                               chipLabel += ' (Classifying...)';
                             }
                             const isRejected = classification && !classification.isRelevant && !manualOverrides[fileObj.file.name];
                             return (
                               <Box key={index} sx={{ display: 'inline-flex', alignItems: 'center', mr: 1, mb: 1 }}>
                                 <Chip
                                   label={chipLabel}
                                   onDelete={() => removeFile(index)}
                                   size="small"
                                   color={chipColor}
                                   icon={classifying && !classification ? <CircularProgress size={16} /> : null}
                                   sx={{
                                     animation: classifying && !classification ? 'chipPulse 1.5s infinite' : 'none',
                                     '@keyframes chipPulse': {
                                       '0%': { transform: 'scale(1)', opacity: 1 },
                                       '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                                       '100%': { transform: 'scale(1)', opacity: 1 }
                                     }
                                   }}
                                 />
                                 {isRejected && (
                                   <Button
                                     size="small"
                                     variant="outlined"
                                     color="warning"
                                     sx={{ ml: 1, fontSize: '0.7rem', padding: '2px 6px' }}
                                     onClick={() => {
                                       setManualOverrides(prev => ({ ...prev, [fileObj.file.name]: true }));
                                       setImageValidationMessage(''); // Clear the warning when user accepts
                                     }}
                                   >
                                     Accept
                                   </Button>
                                 )}
                                 {manualOverrides[fileObj.file.name] && (
                                   <Typography variant="caption" color="success.main" sx={{ ml: 1, fontSize: '0.7rem' }}>
                                     ✓ Accepted
                                   </Typography>
                                 )}
                               </Box>
                             );
                           })}
                         </Box>
                         {!model && (
                           <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                             Loading AI model for image verification...
                           </Typography>
                         )}
                       </Box>
                     )}

                     {imageValidationMessage && (
                       <Alert severity="warning" sx={{ mt: 2 }}>
                         {imageValidationMessage}
                       </Alert>
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