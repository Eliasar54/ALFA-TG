#!/bin/bash

clear

BLUE="\033[38;5;33m"
CYAN="\033[38;5;51m"
WHITE="\033[1;37m"
RESET="\033[0m"

echo -e "${CYAN}🚀 Bienvenido al instalador automático de ALFA-TG.${RESET}"
echo -e "Por favor, lee los términos y condiciones antes de continuar:\n"

echo -e "${BLUE}📜 ¿Aceptas los términos y condiciones? (s/n)${RESET}"
read -p "👉 Elige: " terms

if [[ "$terms" != "s" ]]; then
    echo -e "${CYAN}❌ Instalación cancelada.${RESET}"
    exit 0
fi

echo -e "${BLUE}⚠️ ¿Deseas iniciar el monitor de ALFA-TG? (s/n)${RESET}"
read -p "👉 Elige: " monitor

echo -e "${BLUE}⚠️ ¿Estás seguro de que deseas iniciar la instalación? (s/n)${RESET}"
read -p "👉 Elige: " confirm

if [[ "$confirm" != "s" ]]; then
    echo -e "${CYAN}❌ Instalación cancelada.${RESET}"
    exit 0
fi

echo -e "${CYAN}⏳ Preparando la instalación...${RESET}"

if [[ -n "$PREFIX" ]]; then
    pkg update -y && pkg upgrade -y
    pkg install -y nodejs git npm
else
    if [[ $EUID -ne 0 ]]; then
        sudo apt update -y && sudo apt upgrade -y
        sudo apt install -y nodejs git npm
    else
        apt update -y && apt upgrade -y
        apt install -y nodejs git npm
    fi
fi

echo -e "${CYAN}📥 Clonando el repositorio de ALFA-TG...${RESET}"

if [[ -d "ALFA-TG" ]]; then
    echo -e "${CYAN}⚠️ La carpeta ALFA-TG ya existe. Eliminándola...${RESET}"
    rm -rf ALFA-TG
fi

git clone https://github.com/Eliasar54/ALFA-TG
if [[ $? -ne 0 ]]; then
    echo -e "${CYAN}❌ Error al clonar el repositorio. Verifica tu conexión a internet.${RESET}"
    exit 1
fi

cd ALFA-TG || { echo -e "${CYAN}❌ No se pudo acceder a la carpeta ALFA-TG.${RESET}"; exit 1; }

echo -e "${CYAN}📦 Instalando dependencias necesarias...${RESET}"

if [[ ! -f "package.json" ]]; then
    echo -e "${CYAN}❌ Error: No se encontró package.json. La clonación pudo haber fallado.${RESET}"
    exit 1
fi

npm install --silent
if [[ $? -ne 0 ]]; then
    echo -e "${CYAN}❌ Error al instalar dependencias.${RESET}"
    exit 1
fi

mkdir -p logs

if [[ "$monitor" == "s" ]]; then
    npm run server | tee logs/monitor.log
fi
