import React, { useState, useEffect } from "react";
import axios from "axios";
import { AppBar, Toolbar, Typography, TextField, Button, List, ListItem, ListItemText, Paper, Container, Grid, Snackbar, Alert, IconButton, Card, CardContent, Avatar } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";

interface Usuario {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
}

const UsuarioList: React.FC = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [usuarioAtual, setUsuarioAtual] = useState<Partial<Usuario>>({});
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        axios.get<Usuario[]>('http://localhost:3001/usuario')
            .then(response => setUsuarios(response.data))
            .catch(error => console.error(error));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "telefone") {
            const numericValue = value.replace(/\D/g, "");
            const formattedPhone = numericValue.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4,5})(\d{4})$/, "$1-$2");

            setUsuarioAtual(prevState => ({ ...prevState, telefone: formattedPhone }));

            const plainNumber = numericValue.replace(/[^\d]/g, "");
            setErrors(prevState => ({
                ...prevState,
                telefone: plainNumber.length > 0 && /\D/.test(plainNumber) ? "Apenas números são permitidos." : ""
            }));
        } else {
            setUsuarioAtual(prevState => ({ ...prevState, [name]: value }));
            setErrors(prevState => ({ ...prevState, [name]: "" }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let formErrors: { [key: string]: string } = {};

        if (!usuarioAtual.nome) {
            formErrors.nome = 'Nome é obrigatório.';
        }
        if (!usuarioAtual.email) {
            formErrors.email = 'Email é obrigatório.';
        } else if (!/\S+@\S+\.\S+/.test(usuarioAtual.email)) {
            formErrors.email = 'Email inválido.';
        }

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setOpen(true);
            return;
        }

        const request = usuarioAtual.id
            ? axios.patch(`http://localhost:3001/usuario/${usuarioAtual.id}`, usuarioAtual)
            : axios.post('http://localhost:3001/usuario', usuarioAtual);

        request.then(response => {
            setUsuarios(usuarioAtual.id ? usuarios.map(u => (u.id === usuarioAtual.id ? response.data : u)) : [...usuarios, response.data]);
            setUsuarioAtual({});
            setAlertMessage(usuarioAtual.id ? 'Usuário atualizado com sucesso!' : 'Usuário adicionado com sucesso!');
            setOpen(true);
            window.location.reload();
        })
            .catch(error => {
                console.error(error);
                setAlertMessage('Erro ao salvar usuário.');
                setOpen(true);
            });
    };

    const handleEdit = (usuario: Usuario) => {
        setUsuarioAtual(usuario);
    };

    const handleDelete = (id: number) => {
        axios.delete(`http://localhost:3001/usuario/${id}`)
            .then(() => {
                setUsuarios(usuarios.filter(u => u.id !== id));
                setAlertMessage('Usuário deletado com sucesso!');
                setOpen(true);
                window.location.reload();
            })
            .catch(error => {
                console.error(error);
                setAlertMessage('Erro ao deletar usuário.');
                setOpen(true);
            });
    };

    const handleClose = () => {
        setOpen(false);
        setAlertMessage(null);
    };

    return (
        <div style={{ background: 'linear-gradient(to right, #ECE9E6, #FFFFFF)', minHeight: '100vh', padding: '20px' }}>
            <AppBar position="static" style={{ backgroundColor: '#010b40' }}>
                <Toolbar>
                    <Avatar alt="Logo" src="/logo.png" sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div"
                        sx={{ flexGrow: 1, fontFamily: 'Roboto, sans-serif' }}>
                        Desafio Globus Web
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg">
                <Grid container spacing={3} style={{ marginTop: '20px' }}>
                    <Grid item xs={12} sm={8}> { }
                        <Typography variant="h5" align="center" gutterBottom>
                            Usuários Cadastrados
                        </Typography>
                        <Paper elevation={3} style={{ padding: '20px', backgroundColor: '#fafafa' }}>
                            <List>
                                {usuarios.map(usuario => (
                                    <Card key={usuario.id} variant="outlined" style={{ marginBottom: '10px' }}>
                                        <CardContent>
                                            <ListItem>
                                                <ListItemText
                                                    primary={`${usuario.nome} - ${usuario.email}`}
                                                    secondary={`Telefone: ${usuario.telefone}, Endereço: ${usuario.endereco}`}
                                                />
                                                <IconButton color="primary" onClick={() => handleEdit(usuario)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="secondary" onClick={() => handleDelete(usuario.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItem>
                                        </CardContent>
                                    </Card>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={4}> { }
                        <Typography variant="h5" align="center" gutterBottom>
                            {usuarioAtual.id ? "Editar Usuário" : "Adicionar Usuário"}
                        </Typography>
                        <Paper elevation={3} style={{ padding: '35px', backgroundColor: '#fafafa' }}>
                            <form onSubmit={handleSubmit} noValidate>
                                <Grid container spacing={2} flexDirection="column" alignItems="center">
                                    <TextField
                                        label="Nome"
                                        name="nome"
                                        value={usuarioAtual.nome || ''}
                                        onChange={handleChange}
                                        error={!!errors.nome}
                                        helperText={errors.nome}
                                        required
                                        fullWidth
                                        sx={{ marginBottom: '16px' }}
                                    />
                                    <TextField
                                        label="Email"
                                        name="email"
                                        value={usuarioAtual.email || ''}
                                        onChange={handleChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                        required
                                        fullWidth
                                        sx={{ marginBottom: '16px' }}
                                    />
                                    <TextField
                                        label="Telefone"
                                        name="telefone"
                                        value={usuarioAtual.telefone || ''}
                                        onChange={handleChange}
                                        error={!!errors.telefone}
                                        helperText={errors.telefone}
                                        fullWidth
                                        sx={{ marginBottom: '16px' }}
                                    />
                                    <TextField
                                        label="Endereço"
                                        name="endereco"
                                        value={usuarioAtual.endereco || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={{ marginBottom: '16px' }}
                                    />
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="success"
                                        startIcon={<AddCircleIcon />}
                                        style={{ marginTop: '10px' }}>
                                        {usuarioAtual.id ? "Atualizar" : "Adicionar"}
                                    </Button>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="info" variant="filled">
                    {alertMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UsuarioList;