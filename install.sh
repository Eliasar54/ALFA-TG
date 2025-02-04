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
    pkg update -y > /dev/null 2>&1
    pkg upgrade -y > /dev/null 2>&1
    pkg install -y nodejs git npm > /dev/null 2>&1
else
    if [[ $EUID -ne 0 ]]; then
        sudo apt update -y > /dev/null 2>&1
        sudo apt upgrade -y > /dev/null 2>&1
        sudo apt install -y nodejs git npm > /dev/null 2>&1
    else
        apt update -y > /dev/null 2>&1
        apt upgrade -y > /dev/null 2>&1
        apt install -y nodejs git npm > /dev/null 2>&1
    fi
fi

echo -e "${CYAN}📥 Clonando el repositorio de ALFA-TG...${RESET}"
git clone https://github.com/Eliasar54/ALFA-TG > /dev/null 2>&1
cd ALFA-TG

echo -e "${CYAN}📦 Instalando dependencias necesarias...${RESET}"
npm install --silent > /dev/null 2>&1

clear

echo -e "${BLUE}⚙️ ¿Quieres añadirte como owner del bot? (s/n)${RESET}"
read -p "👉 Elige: " add_owner

if [[ "$add_owner" == "s" ]]; then
    read -p "🆔 Ingresa tu ID de Telegram https://t.me/userinfobot para obtener tu id: " user_id
    read -p "👤 Ingresa tu nombre: " user_name

    owners_file="./config/owners.json"

    if [[ -f "$owners_file" ]]; then
        temp_file=$(mktemp)
        jq --arg id "$user_id" --arg name "$user_name" '.owners += [{"id": $id, "name": $name}]' "$owners_file" > "$temp_file" && mv "$temp_file" "$owners_file"
        echo -e "${CYAN}✅ Se ha añadido a $user_name (ID: $user_id) como owner.${RESET}"
    else
        echo -e "${CYAN}⚠️ No se encontró el archivo de owners. Creando uno nuevo...${RESET}"
        echo "{\"owners\": [{\"id\": \"$user_id\", \"name\": \"$user_name\"}]}" > "$owners_file"
        echo -e "${CYAN}✅ Se ha añadido a $user_name (ID: $user_id) como owner.${RESET}"
    fi
fi

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
    npm run server > /dev/null 2>&1
else
    echo -e "${CYAN}🤖 Iniciando ALFA-TG...${RESET}"
    npm start > /dev/null 2>&1
fi