"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Modal, Grid2, Grid } from '@mui/material';

type Cliente = {
  estu_id: string;
  estu_nombre: string;
  estu_codigo: string;
  estu_correo: string;
  estu_programa: string;
  estu_created_at: string;
};

const Clientes = () => {
  const { data: session, status } = useSession();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{
    estu_nombre?: string;
    estu_codigo?: string;
    estu_correo?: string;
    estu_programa?: string;}>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [newCliente, setNewCliente] = useState({
    estu_nombre: "",
    estu_codigo: "",
    estu_correo: "",
    estu_programa: "",
  });


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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estudiantes`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${session.user.token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data: Cliente[] = await res.json();
        setClientes(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchData();
  }, [session?.user?.token]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este estudiante?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estudiantes/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.user?.token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      setClientes((prevClientes) => prevClientes.filter((cliente) => cliente.estu_id !== id));
      alert("Estudiante eliminado con éxito.");
    } catch (err) {
      console.error("Error al eliminar el estudiante:", err);
      alert("No se pudo eliminar el estudiante.");
    }
  };

  const handleEdit = (id: string) => {
    setEditRowId(id);
    const cliente = clientes.find((c) => c.estu_id === id);
    if (cliente) {
      setEditedData({ estu_codigo: cliente.estu_codigo, estu_nombre: cliente.estu_nombre,
        estu_correo: cliente.estu_correo, estu_programa: cliente.estu_programa
       });
    }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estudiantes/${id}`, {
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

      setClientes((prevClientes) =>
        prevClientes.map((cliente) =>
          cliente.estu_id === id
            ? { ...cliente, ...editedData }
            : cliente
        )
      );
      setEditRowId(null);
      setEditedData({});
      alert("Estudiante actualizado con éxito.");
    } catch (err) {
      console.error("Error al actualizar el estudiante:", err);
      alert("No se pudo actualizar el estudiante.");
    }
  };

  const handleCancel = () => {
    setEditRowId(null);
    setEditedData({});
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCliente = async () => {
    if (!newCliente.estu_codigo || !newCliente.estu_correo || !newCliente.estu_nombre || !newCliente.estu_programa) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estudiantes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(newCliente),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const createdCliente: Cliente = await res.json();
      setClientes((prevClientes) => [...prevClientes, createdCliente]);
      setModalOpen(false);
      setNewCliente({ estu_codigo: "", estu_correo: "", estu_nombre: "", estu_programa: "" });
      alert("Estudiante creado con éxito.");
    } catch (err) {
      console.error("Error al crear el estudiante:", err);
      alert("No se pudo crear el estudiante.");
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Grid2 container alignItems="center" justifyContent="space-between">
        <Grid item xs={10} container justifyContent="center">
          <Typography variant="h4" gutterBottom color='blue'>
            Reporte de Estudiantes
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
              <TableCell>Codigo</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Programa</TableCell>
              <TableCell>Fecha Auditoria</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientes.map((cliente) => (
              <TableRow key={cliente.estu_id}>
                <TableCell>{cliente.estu_id}</TableCell>
                <TableCell>
                  {editRowId === cliente.estu_id ? (
                    <TextField
                      value={editedData.estu_codigo || ""}
                      onChange={(e) => handleInputChange("estu_codigo", e.target.value)}
                      size="small"
                    />
                  ) : (
                    cliente.estu_codigo
                  )}
                </TableCell>
                <TableCell>
                  {editRowId === cliente.estu_id ? (
                    <TextField
                      value={editedData.estu_nombre || ""}
                      onChange={(e) => handleInputChange("estu_nombre", e.target.value)}
                      size="small"
                    />
                  ) : (
                    cliente.estu_nombre || "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {editRowId === cliente.estu_id ? (
                    <TextField
                      value={editedData.estu_correo || ""}
                      onChange={(e) => handleInputChange("estu_correo", e.target.value)}
                      size="small"
                    />
                  ) : (
                    cliente.estu_correo || "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {editRowId === cliente.estu_id ? (
                    <TextField
                      value={editedData.estu_programa || ""}
                      onChange={(e) => handleInputChange("estu_programa", e.target.value)}
                      size="small"
                    />
                  ) : (
                    cliente.estu_programa || "N/A"
                  )}
                </TableCell>
                <TableCell>{new Date(cliente.estu_created_at).toLocaleString()}</TableCell>
                <TableCell>
                  {editRowId === cliente.estu_id ? (
                    <>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleSave(cliente.estu_id)}
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
                        onClick={() => handleEdit(cliente.estu_id)}
                        sx={{ marginRight: 1 }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => handleDelete(cliente.estu_id)}
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
            Crear Nuevo Cliente
          </Typography>
          <TextField
            fullWidth
            label="Codigo"
            variant="outlined"
            value={newCliente.estu_codigo}
            onChange={(e) => setNewCliente({ ...newCliente, estu_codigo: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Nombre"
            variant="outlined"
            value={newCliente.estu_nombre}
            onChange={(e) => setNewCliente({ ...newCliente, estu_nombre: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={newCliente.estu_correo}
            onChange={(e) => setNewCliente({ ...newCliente, estu_correo: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Programa"
            variant="outlined"
            value={newCliente.estu_programa}
            onChange={(e) => setNewCliente({ ...newCliente, estu_programa: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddCliente}
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

export default Clientes;
