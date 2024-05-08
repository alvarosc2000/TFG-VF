const express = require('express');
const router = express.Router();
const { Evento } = require('../../database/sequelize-config');

router.get('/mostrar_evento', async (req, res) => {
    try {
        const eventos = await Evento.findAll();
        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener los eventos:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los eventos' });
    }
});


module.exports = router;
