/* Bondi Smash (marca ficticia, demo de restoweb) — datos de marca editables.
   Cambiá acá el número de WhatsApp, horarios y turnos de reserva.
   Los productos y precios del pedido se leen del menú de la página (data-item / data-price). */
(function () {
  "use strict";
  window.__BRAND__ = {
    name: "Bondi Smash",
    whatsapp: "5491167922355",            // formato internacional, sin + ni espacios
    whatsappDisplay: "+54 9 11 6792-2355",
    address: "Padilla 820, Villa Crespo, CABA",
    // Turnos del formulario de reservas, por día (0 = domingo … 6 = sábado).
    // Horario: mar–dom 12–15:30 y 19–00 · lunes cerrado.
    slots: {
      lunch:  ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30"],
      dinner: ["19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"]
    },
    lunchDays: [0, 2, 3, 4, 5, 6],         // días con turno de mediodía
    closedDays: [1],                       // días sin reservas
    messages: {
      question: "¡Hola Bondi Smash! Tengo una consulta: "
    }
  };
})();
