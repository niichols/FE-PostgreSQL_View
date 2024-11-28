"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Grid2, Grid, Modal } from '@mui/material';

type Libro = {
  libr_id: string;
  libr_nombre: string;
  libr_autor: string;
  libr_editorial: string;
  libr_ano: string;
  libr_created_at: string;
};

const Libros = () => {
  const { data: session, status } = useSession();
  const [libros, setLibros] = useState<Libro[]>([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{ libr_nombre?: string; libr_autor?: string }>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [newLibro, setNewLibro] = useState({
    libr_nombre: "",
    libr_autor: "",
    libr_editorial: "",
    libr_ano: "",
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/libros`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${session.user.token}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data: Libro[] = await res.json();
        setLibros(data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    fetchData();
  }, [session?.user?.token]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este libro?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/libros/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.user?.token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      // Actualizar la lista de libros eliminando el libro borrado
      setLibros((prevLibros) => prevLibros.filter((libro) => libro.libr_id !== id));
      alert("Libro eliminado con éxito.");
    } catch (err) {
      console.error("Error al eliminar el libro:", err);
      alert("No se pudo eliminar el libro.");
    }
  };

  const handleEdit = (id: string) => {
    setEditRowId(id);
    const libro = libros.find((c) => c.libr_id === id);
    if (libro) {
      setEditedData({ libr_nombre: libro.libr_nombre, libr_autor: libro.libr_autor });
    }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/libros/${id}`, {
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

      setLibros((prevLibros) =>
        prevLibros.map((libro) =>
          libro.libr_id === id
            ? { ...libro, ...editedData }
            : libro
        )
      );
      setEditRowId(null);
      setEditedData({});
      alert("Libro actualizado con éxito.");
    } catch (err) {
      console.error("Error al actualizar el libro:", err);
      alert("No se pudo actualizar el libro.");
    }
  };

  const handleCancel = () => {
    setEditRowId(null);
    setEditedData({});
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddLibro = async () => {
    if (!newLibro.libr_nombre || !newLibro.libr_autor || !newLibro.libr_editorial || !newLibro.libr_ano) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/libros`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify(newLibro),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const createdLibro: Libro = await res.json();
      setLibros((prevLibros) => [...prevLibros, createdLibro]);
      setModalOpen(false);
      setNewLibro({ libr_nombre: "", libr_autor: "", libr_editorial: "", libr_ano: "" });
      alert("Libro creado con éxito.");
    } catch (err) {
      console.error("Error al crear el libro:", err);
      alert("No se pudo crear el libro.");
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Grid2 container alignItems="center" justifyContent="space-between">
        <Grid item xs={10} container justifyContent="center">
          <Typography variant="h4" gutterBottom color='blue'>
            Lista de Libros
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
              <TableCell>Email</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {libros.map((libro) => (
             <TableRow key={libro.libr_id}>
             <TableCell>{libro.libr_id}</TableCell>
             <TableCell>
               {editRowId === libro.libr_id ? (
                 <TextField
                   value={editedData.libr_nombre || ""}
                   onChange={(e) => handleInputChange("libr_nombre", e.target.value)}
                   size="small"
                 />
               ) : (
                 libro.libr_nombre
               )}
             </TableCell>
             <TableCell>
               {editRowId === libro.libr_id ? (
                 <TextField
                   value={editedData.libr_autor || ""}
                   onChange={(e) => handleInputChange("libr_autor", e.target.value)}
                   size="small"
                 />
               ) : (
                 libro.libr_autor || "N/A"
               )}
             </TableCell>
             <TableCell>{new Date(libro.libr_created_at).toLocaleString()}</TableCell>
             <TableCell>
               {editRowId === libro.libr_id ? (
                 <>
                   <Button
                     variant="outlined"
                     color="primary"
                     size="small"
                     onClick={() => handleSave(libro.libr_id)}
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
                     onClick={() => handleEdit(libro.libr_id)}
                     sx={{ marginRight: 1 }}
                   >
                     Editar
                   </Button>
                   <Button
                     variant="outlined"
                     color="secondary"
                     size="small"
                     onClick={() => handleDelete(libro.libr_id)}
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
            Crear Nuevo Libro
          </Typography>
          <TextField
            fullWidth
            label="Nombre"
            variant="outlined"
            value={newLibro.libr_nombre}
            onChange={(e) => setNewLibro({ ...newLibro, libr_nombre: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Autor"
            variant="outlined"
            value={newLibro.libr_autor}
            onChange={(e) => setNewLibro({ ...newLibro, libr_autor: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Editorial"
            variant="outlined"
            value={newLibro.libr_editorial}
            onChange={(e) => setNewLibro({ ...newLibro, libr_editorial: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            fullWidth
            label="Ano"
            variant="outlined"
            value={newLibro.libr_ano}
            onChange={(e) => setNewLibro({ ...newLibro, libr_ano: e.target.value })}
            sx={{ marginBottom: 2 }}
          />
          
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddLibro}
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

export default Libros;
