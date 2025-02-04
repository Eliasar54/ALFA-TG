const rangos = [
  { nivel: 1, rango: "Novato Espadachín", estilo: "⚔️" },
  { nivel: 5, rango: "Guerrero Aprendiz", estilo: "🛡️" },
  { nivel: 10, rango: "Mago en Entrenamiento", estilo: "🔮" },
  { nivel: 20, rango: "Cazador de Sombras", estilo: "🌑" },
  { nivel: 30, rango: "Espadachín Legendario", estilo: "🔥" },
  { nivel: 50, rango: "Maestro de Dragones", estilo: "🐉" },
  { nivel: 70, rango: "Sabio Celestial", estilo: "✨" },
  { nivel: 100, rango: "Deidad del Anime", estilo: "🌌" }
];

const obtenerRango = (nivel) => {
  let rangoActual = "Novato Espadachín";
  let estiloActual = "⚔️";
  for (const rango of rangos) {
    if (nivel >= rango.nivel) {
      rangoActual = rango.rango;
      estiloActual = rango.estilo;
    }
  }
  return { rangoActual, estiloActual };
};

module.exports = { rangos, obtenerRango };