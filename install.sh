#!/bin/bash

clear

BLUE="\033[38;5;33m"
CYAN="\033[38;5;51m"
WHITE="\033[1;37m"
RESET="\033[0m"

echo -e "${CYAN}   .  __ "
echo -e "    / )))           _ "
echo -e "   ／ イ          ((( "
echo -e "  (  ﾉ            ￣Ｙ＼"
echo -e "  | (＼   ∧＿∧  ｜ )"
echo -e "  ヽ ヽ\`(´･ω･)_／ノ/"
echo -e "    ＼ |   ⌒Ｙ⌒   / /"
echo -e "      \ヽ    ｜    ﾉ／"
echo -e "       ＼ ﾄー仝ーｲ /"
echo -e "        ｜  ミ土彡 ｜${RESET}"

echo -e "${WHITE}🚀 Bienvenido al instalador automático de ${CYAN}ALFA-TG${WHITE}, tu bot para Telegram.${RESET}"
echo -e "Por favor, lee los términos y condiciones antes de continuar:\n"

echo -e "${BLUE}📜 Términos y Condiciones:${RESET}"
echo -e "1️⃣ El uso de ALFA-TG es bajo tu responsabilidad."
echo -e "2️⃣ No nos hacemos responsables por el mal uso de este software."
echo -e "3️⃣ Se prohíbe utilizar ALFA-TG para actividades ilícitas."
echo -e "4️⃣ Al continuar, aceptas estos términos y condiciones."

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
    pkg install -y nodejs git npm jq
else
    if [[ $EUID -ne 0 ]]; then
        sudo apt update -y && sudo apt upgrade -y
        sudo apt install -y nodejs git npm jq
    else
        apt update -y && apt upgrade -y
        apt install -y nodejs git npm jq
    fi
fi

if [[ ! -d "ALFA-TG" ]]; then
    git clone https://github.com/Eliasar54/ALFA-TG
    if [[ $? -ne 0 ]]; then
        echo -e "${CYAN}❌ Error al clonar el repositorio. Verifica tu conexión a internet.${RESET}"
        exit 1
    fi
fi

cd ALFA-TG || { echo -e "${CYAN}❌ No se pudo acceder a la carpeta ALFA-TG.${RESET}"; exit 1; }

if [[ ! -d "node_modules" ]]; then
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
fi

mkdir -p logs

clear

echo -e "${BLUE}"
echo "╔═╗╔═╦╗╔═╗╔═╗╔══╗╔══╗╔═╦╗╔══╗╔═╗  ╔╗─╔══╗  ╔══╗╔═╦╗╔══╗╔══╗╔══╗╔╗─╔══╗╔═╗╔══╗╔═╦╗"
echo "║╦╝║║║║║╬║║╦╝║══╣║╔╗║║║║║╚╗╗║║║║  ║║─║╔╗║  ╚║║╝║║║║║══╣╚╗╔╝║╔╗║║║─║╔╗║║╔╝╚║║╝║║║║"
echo "║╩╗║║║║║╔╝║╩╗╠══║║╠╣║║║║║╔╩╝║║║║  ║╚╗║╠╣║  ╔║║╗║║║║╠══║─║║─║╠╣║║╚╗║╠╣║║╚╗╔║║╗║║║║"
echo "╚═╝╚╩═╝╚╝─╚═╝╚══╝╚╝╚╝╚╩═╝╚══╝╚═╝  ╚═╝╚╝╚╝  ╚══╝╚╩═╝╚══╝─╚╝─╚╝╚╝╚═╝╚╝╚╝╚═╝╚══╝╚╩═╝"
echo "────────────────────────────────  ───────  ──────────────────────────────────────"
echo -e "${RESET}"

if [[ "$monitor" == "s" ]]; then
    echo -e "${CYAN}🚀 Iniciando el monitor de ALFA-TG...${RESET}"
    npm run server | tee logs/monitor.log
else
    echo -e "${CYAN}🚀 Iniciando ALFA-TG...${RESET}"
    npm start
fi
