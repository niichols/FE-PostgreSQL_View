"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Grid2, Grid, Modal } from '@mui/material';

type Equipo = {
  equi_id: string;
  equi_cantidad: string;
  equi_nombre: string;
  equi_created_at: string;
};

const Equipos = () => {
  const { data: session, status } = useSession();
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{ equi_cantidad?: string; equi_nombre?: string }>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [newEquipo, setNewEquipo] = useState({
    equi_nombre: "",
    equi_cantidad: "",
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/equipos`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${session.user.token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data: Equipo[] = await res.json();
        setEquipos(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchData();
  }, [session?.user?.token]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/equipos/${id}`, {
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
      setEquipos((prevequipos) => prevequipos.filter((equipo) => equipo.equi_id !== id));
      alert("equipo eliminado con éxito.");
    } catch (err) {
      console.error("Error al eliminar el equipo:", err);
      alert("No se pudo eliminar el equipo.");
    }
  };

  const handleEdit = (id: string) => {
    setEditRowId(id);
    const equipo = equipos.find((c) => c.equi_id === id);
    if (equipo) {
      setEditedData({ equi_cantidad: equipo.equi_cantidad, equi_nombre: equipo.equi_nombre});
    }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/equipos/${id}`, {
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

      setEquipos((prevEqipos) =>
        prevEqipos.map((equipo) =>
          equipo.equi_id === id
            ? { ...equipo, ...editedData }
            : equipo
        )
      );
      setEditRowId(null);
      setEditedData({});
      alert("Equipo actualizado con éxito.");
    } catch (err) {
      console.error("Error al actualizar el Equipo:", err);
      alert("No se pudo actualizar el equipo.");
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
    if (!newEquipo.equi_nombre || !newEquipo.equi_nombre) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/equipos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(newEquipo),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const createdEquipo: Equipo = await res.json();
      setEquipos((prevEqipos) => [...prevEqipos, createdEquipo]);
      setModalOpen(false);
      setNewEquipo({ equi_nombre: "", equi_cantidad: "" });
      alert("Equipo creado con éxito.");
    } catch (err) {
      console.error("Error al crear el equipo:", err);
      alert("No se pudo crear el equipo.");
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Grid2 container alignItems="center" justifyContent="space-between">
        <Grid item xs={10} container justifyContent="center">
          <Typography variant="h4" gutterBottom color='blue'>
            Lista de Equipos
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
              <TableCell>Cantida</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipos.map((equipo) => (
              <TableRow key={equipo.equi_id}>
              <TableCell>{equipo.equi_id}</TableCell>
              <TableCell>
                {editRowId === equipo.equi_id ? (
                  <TextField
                    value={editedData.equi_cantidad || ""}
                    onChange={(e) => handleInputChange("equi_cantidad", e.target.value)}
                    size="small"
                  />
                ) : (
                  equipo.equi_cantidad
                )}
              </TableCell>
              <TableCell>
                {editRowId === equipo.equi_id ? (
                  <TextField
                    value={editedData.equi_nombre || ""}
                    onChange={(e) => handleInputChange("equi_nombre", e.target.value)}
                    size="small"
                  />
                ) : (
                  equipo.equi_nombre || "N/A"
                )}
              </TableCell>
              <TableCell>{new Date(equipo.equi_created_at).toLocaleString()}</TableCell>
              <TableCell>
                {editRowId === equipo.equi_id ? (
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleSave(equipo.equi_id)}
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
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(equipo.equi_id)}
                      sx={{ marginRight: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleDelete(equipo.equi_id)}
                    >
                      Eliminar
                    </Button>
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
            Crear Nuevo Equipo
          </Typography>
          <TextField
            fullWidth
            label="Nombre"
            variant="outlined"
            value={newEquipo.equi_nombre}
            onChange={(e) => setNewEquipo({ ...newEquipo, equi_nombre: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Cantidad"
            variant="outlined"
            value={newEquipo.equi_cantidad}
            onChange={(e) => setNewEquipo({ ...newEquipo, equi_cantidad: e.target.value })}
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

export default Equipos;
