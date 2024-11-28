"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Grid2, Grid, Modal, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type Reserva = {
  rese_id: string;
  rese_observacion: string;
  rese_entrega: string;
  rese_created_at: string;
  libr_id: string;
  equi_id: string;
  clie_id: string;
  esta_id: string;
};

const Reservas = () => {
  const { data: session, status } = useSession();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{ 
  rese_observacion?: string; rese_entrega?: string; libr_id?: string; 
  equi_id?: string; clie_id?: string; esta_id?: string }>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [newReserva, setNewReserva] = useState({
    rese_observacion: "",
    rese_entrega: "",
    libr_id: "",
    equi_id: "",
    clie_id: "",
    esta_id: "",
  });

  console.log(session?.user);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) {
        console.error("Token de sesión no disponible.");
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reservas`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${session.user.token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data: Reserva[] = await res.json();
        setReservas(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchData();
  }, [session?.user?.token]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este reservas?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reservas/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.user?.token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      // Actualizar la lista de equipos eliminando el equipo borrado
      setReservas((prevreservas) => prevreservas.filter((reserva) => reserva.rese_id !== id));
      alert("reserva eliminado con éxito.");
    } catch (err) {
      console.error("Error al eliminar el reserva:", err);
      alert("No se pudo eliminar el reserva.");
    }
  };

  const handleEdit = (id: string) => {
    setEditRowId(id);
    const reserva = reservas.find((c) => c.rese_id === id);
    if (reserva) {
      setEditedData({ rese_observacion: reserva.rese_observacion, rese_entrega: reserva.rese_entrega, 
        clie_id: reserva.clie_id, equi_id: reserva.equi_id, esta_id: reserva.esta_id, libr_id: reserva.libr_id});
    }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reservas/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(editedData),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      setReservas((prevReservas) =>
        prevReservas.map((reserva) =>
          reserva.rese_id === id
            ? { ...reserva, ...editedData }
            : reserva
        )
      );
      setEditRowId(null);
      setEditedData({});
      alert("Reserva actualizado con éxito.");
    } catch (err) {
      console.error("Error al actualizar la reserva:", err);
      alert("No se pudo actualizar la reserva.");
    }
  };

  const handleCancel = () => {
    setEditRowId(null);
    setEditedData({});
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddEquipo = async () => {
    if (!newReserva.rese_observacion || !newReserva.rese_entrega || !newReserva.clie_id || 
      !newReserva.equi_id || !newReserva.esta_id || !newReserva.libr_id
    ) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(newReserva),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const createdReserva: Reserva = await res.json();
      setReservas((prevReservas) => [...prevReservas, createdReserva]);
      setModalOpen(false);
      setNewReserva({ rese_observacion: "", rese_entrega: "", clie_id: "", equi_id: "", esta_id: "", libr_id: ""});
      alert("Reserva creado con éxito.");
    } catch (err) {
      console.error("Error al crear el reserva:", err);
      alert("No se pudo crear el reserva.");
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Grid2 container alignItems="center" justifyContent="space-between">
        <Grid item xs={10} container justifyContent="center">
          <Typography variant="h4" gutterBottom color='blue'>
            Lista de Reservas
            </Typography>
        </Grid>
        <Grid item xs={2} container justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => setModalOpen(true)}
              sx={{ marginBottom: 2 }}
              >Nuevo
          </Button>
        </Grid>
      </Grid2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Observacion</TableCell>
              <TableCell>Entrega</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Libro</TableCell>
              <TableCell>Equipo</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservas.map((reserva) => (
              <TableRow key={reserva.rese_id}>
              <TableCell>{reserva.rese_id}</TableCell>
              <TableCell>
                {editRowId === reserva.rese_id ? (
                  <TextField
                    value={editedData.rese_observacion || ""}
                    onChange={(e) => handleInputChange("rese_observacion", e.target.value)}
                    size="small"
                  />
                ) : (
                  reserva.rese_observacion
                )}
              </TableCell>
              <TableCell>
                {editRowId === reserva.rese_id ? (
                  <TextField
                    value={editedData.rese_entrega || ""}
                    onChange={(e) => handleInputChange("rese_entrega", e.target.value)}
                    size="small"
                  />
                ) : (
                  reserva.rese_entrega || "N/A"
                )}
              </TableCell>
              <TableCell>{new Date(reserva.rese_created_at).toLocaleString()}</TableCell>
              <TableCell>
                {editRowId === reserva.rese_id ? (
                  <TextField
                    value={editedData.libr_id || ""}
                    onChange={(e) => handleInputChange("libr_id", e.target.value)}
                    size="small"
                  />
                ) : (
                  reserva.libr_id || "N/A"
                )}
              </TableCell>
              <TableCell>
                {editRowId === reserva.rese_id ? (
                  <TextField
                    value={editedData.equi_id || ""}
                    onChange={(e) => handleInputChange("equi_id", e.target.value)}
                    size="small"
                  />
                ) : (
                  reserva.equi_id || "N/A"
                )}
              </TableCell>
              <TableCell>
                {editRowId === reserva.rese_id ? (
                  <TextField
                    value={editedData.clie_id || ""}
                    onChange={(e) => handleInputChange("clie_id", e.target.value)}
                    size="small"
                  />
                ) : (
                  reserva.clie_id || "N/A"
                )}
              </TableCell>
              <TableCell>
                {editRowId === reserva.rese_id ? (
                  <TextField
                    value={editedData.esta_id || ""}
                    onChange={(e) => handleInputChange("esta_id", e.target.value)}
                    size="small"
                  />
                ) : (
                  reserva.esta_id || "N/A"
                )}
              </TableCell>
              <TableCell>
                {editRowId === reserva.rese_id ? (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleSave(reserva.rese_id)}
                      sx={{ marginRight: 1 }}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                  <Grid2 container spacing={2}>
                    <Grid item>
                      <Tooltip title="Editar" arrow>
                      <IconButton
                      type="submit"
                      onClick={() => handleEdit(reserva.rese_id)}
                      style={{ background: 'green' }}
                      size='small'
                      >
                        <EditIcon style={{ color: 'white' }} />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                    <Tooltip title="Eliminar" arrow>
                      <IconButton
                      type="reset"
                      onClick={() => handleDelete(reserva.rese_id)}
                      style={{ background: 'red' }}
                      size='small'>
                        <DeleteIcon style={{ color: 'white' }} />
                        </IconButton>
                    </Tooltip>
                    </Grid>
                  </Grid2>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <Modal open={isModalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Crear Nueva Reserva
          </Typography>
          <TextField
            fullWidth
            label="Observacion"
            variant="outlined"
            value={newReserva.rese_observacion}
            onChange={(e) => setNewReserva({ ...newReserva, rese_observacion: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Entrega"
            variant="outlined"
            value={newReserva.rese_entrega}
            onChange={(e) => setNewReserva({ ...newReserva, rese_entrega: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Libro"
            variant="outlined"
            value={newReserva.libr_id}
            onChange={(e) => setNewReserva({ ...newReserva, libr_id: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Equipo"
            variant="outlined"
            value={newReserva.equi_id}
            onChange={(e) => setNewReserva({ ...newReserva, equi_id: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Cliente"
            variant="outlined"
            value={newReserva.clie_id}
            onChange={(e) => setNewReserva({ ...newReserva, clie_id: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Estado"
            variant="outlined"
            value={newReserva.esta_id}
            onChange={(e) => setNewReserva({ ...newReserva, esta_id: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddEquipo}
              sx={{ marginRight: 1 }}
            >
              Guardar
            </Button>
            <Button variant="outlined" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
          </Box>
        </Box>
      </Modal>

  </Box>
  );
};

export default Reservas;
